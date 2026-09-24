import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
// @ts-ignore
import { UserService } from "../user/user.service";
import { Credentials, ResetEmailCredential } from "./Credentials";
import { PasswordService } from "./password.service";
import { UserInfo, User, ApiError } from "./UserInfo";
import { EmailResetPasswordCredential, ResetPasswordCredential, UserCredentials, InviteUserByEmailCredential } from "./Credentials";
import axios from 'axios';
import { createClient } from '@supabase/supabase-js'
import { PrismaService } from 'nestjs-prisma';
// @ts-ignore
import { sendEmail_SendinBlue } from 'src/util/sendEmail';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    protected readonly prisma: PrismaService,
  ) { }

  /**
   * Validation simple du user
   */
  async validateUser(username: string, password: string): Promise<UserInfo | null> {
    const user = await this.userService.findOne({
      where: { username },
    });
    if (user && user.username === username) {
      const { roles } = user;
      return { username, roles };
    }
    return null;
  }

  /**
   * LOGIN : Vérifie le statut Prisma AVANT de demander un token à Supabase
   */
  async supabaseLogin(credentials: Credentials) {
    const emailNormalized = credentials.email.toLowerCase();

    // 1️⃣ Vérification du statut dans la base de données locale
    const dbUser = await this.prisma.user.findUnique({
      where: { username: emailNormalized },
      select: { isValid: true, status: true }
    });

    if (dbUser) {
      if (dbUser.status === 'EN_ATTENTE') {
        throw new UnauthorizedException('Votre compte est en attente de validation par un administrateur.');
      }
      if (dbUser.status === 'REJETE') {
        throw new UnauthorizedException("Votre demande d'accès a été refusée. Contactez le support.");
      }
      if (dbUser.status === 'DESACTIVE' || !dbUser.isValid) {
        throw new UnauthorizedException('Votre compte est désactivé. Contactez un administrateur.');
      }
    }

    // 2️⃣ Authentification Supabase via Kong
    try {
      const { data } = await axios.post(
        `${process.env.KONG_URL}/auth/v1/token?grant_type=password`,
        {
          email: emailNormalized,
          password: credentials.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.ANON_KEY as string,
            Authorization: `Bearer ${process.env.SERVICE_ROLE_KEY}`,
          },
        }
      );
      return data;
    } catch (error: any) {
      throw new UnauthorizedException(error?.response?.data?.error_description || 'Identifiants invalides');
    }
  }

  /**
   * SIGNUP : Création sans login automatique
   */
  async signUp(credentials: UserCredentials): Promise<any> {
    if (
      ['service_role', 'admin', 'super-admin'].includes(credentials.role?.toLowerCase() || '')
    ) {
      throw new UnauthorizedException(`Rôle non autorisé : ${credentials.role}`);
    }

    const emailNormalized = credentials.email.toLowerCase();

    try {
      // 1️⃣ Création dans Supabase Auth
      await axios.post(
        `${process.env.KONG_URL}/auth/v1/admin/users`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.ANON_KEY || '',
            'Authorization': `Bearer ${process.env.SERVICE_ROLE_KEY || ''}`
          }
        }
      );

      // 2️⃣ Création ou mise à jour dans Prisma
      const newUser = await this.prisma.user.upsert({
        where: { username: emailNormalized },
        update: {
          firstName: credentials.firstName ?? null,
          lastName: credentials.lastName ?? null,
          isValid: false,
          status: 'EN_ATTENTE' as any,
        },
        create: {
          username: emailNormalized,
          email: emailNormalized,
          firstName: credentials.firstName ?? null,
          lastName: credentials.lastName ?? null,
          isValid: false,
          status: 'EN_ATTENTE' as any,
          roles: { set: ['user'] },
        }
      });

      // 3️⃣ Notifications et Email
      await this.notifyAdminsNewUser(newUser);

      try {
        await this.sendEmail(
  newUser.email!,
  'Compte créé — En attente de validation',
  `<h2>Bonjour ${newUser.firstName ?? ''}</h2>
   <p>Votre compte sur <b>${process.env.APP_NAME}</b> a été créé avec succès.</p>
   <p>Il est actuellement <b>en attente de validation</b> par un administrateur.</p>`,
  'Votre compte est en attente de validation.'
);
      } catch (e) { console.error('Email error:', e); }

      return {
        success: true,
        status: 'EN_ATTENTE',
        message: 'Inscription réussie. Votre compte est en attente de validation.'
      };

    } catch (error: any) {
      console.error('❌ SIGNUP ERROR:', error?.response?.data || error);
      throw new BadRequestException(error?.response?.data?.message || 'Erreur lors de la création du compte');
    }
  }

  /**
   * INVITATION : Gestion des invitations par email
   */
  async inviteUserByEmail(credential: InviteUserByEmailCredential) {
    const email = credential.email.toLowerCase();
    const supabase = createClient(process.env.KONG_URL!, process.env.SERVICE_ROLE_KEY!);
    const redirectTo = `${process.env.SITE_URL}/auth/password-reset`;
    let actionLink = null;

    try {
      const { data, error } = await supabase.auth.api.generateLink("invite", email, {
        redirectTo: credential.options?.redirectTo || redirectTo,
        data: credential.options?.data,
      });

      if (error) {
        if (error.status === 422) {
          await supabase.auth.api.resetPasswordForEmail(email, { redirectTo });
          actionLink = "Lien de réinitialisation envoyé (utilisateur déjà existant)";
        } else throw error;
      } else {
        actionLink = (data as any).action_link;
      }
    } catch (err) {
      throw new BadRequestException("Erreur Supabase lors de l'invitation");
    }

    const rawData = credential.options?.data as any;
    const roles = Array.isArray(rawData?.roles) ? rawData.roles : [rawData?.roles || "user"];

    const user = await this.prisma.user.upsert({
      where: { username: email },
      update: {
        firstName: rawData?.firstName ?? null,
        lastName: rawData?.lastName ?? null,
        isValid: rawData?.isValid ?? false,
        roles: { set: roles },
      },
      create: {
        username: email,
        email: email,
        firstName: rawData?.firstName ?? null,
        lastName: rawData?.lastName ?? null,
        isValid: rawData?.isValid ?? false,
        roles: { set: roles },
      },
    });

    await this.notifyAdminsNewUser(user);

    if (actionLink && !actionLink.includes("réinitialisation")) {
        await this.sendEmail(
            email, 
            `Invitation - ${process.env.APP_NAME}`, 
            `<p>Vous avez été invité. <a href="${actionLink}">Cliquez ici</a></p>`, 
            `Lien : ${actionLink}`
        );
    }

    return { success: true, user };
  }

  /**
   * ACTIVATION : Approuver un utilisateur
   */
// auth.service.ts — activateUser
async activateUser(userId: string) {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: { isValid: true, status: 'ACTIF' as any }
  });

  await this.prisma.notification.create({
    data: {
      userId:  userId,
      message: 'Votre compte a été activé. Vous pouvez maintenant vous connecter.',
      type:    'ACTIVATION' as any,
      isRead:  false,
    }
  });

  // ✅ Utiliser username si email est null
  const emailTo = user.email || user.username

  if (emailTo) {
    try {
      await this.sendEmail(
        emailTo,
        `Compte activé — ${process.env.APP_NAME}`,
        `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#0077b6">
              Bonjour ${user.firstName || ''} ${user.lastName || ''} !
            </h2>
            <p>Votre compte sur <b>${process.env.APP_NAME}</b> a été <b style="color:green">activé</b> par un administrateur.</p>
            <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:8px;padding:16px;margin:20px 0">
              <h3 style="color:#155724;margin:0">✅ Compte activé !</h3>
              <p style="color:#155724;margin:8px 0 0">
                Vous pouvez maintenant vous connecter à la plateforme.
              </p>
            </div>
            <a 
              href="${process.env.SITE_URL}/auth/sign-in"
              style="display:inline-block;background:#0077b6;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px"
            >
              Se connecter
            </a>
          </div>
        `,
        `Votre compte a été activé. Connectez-vous sur : ${process.env.SITE_URL}/auth/sign-in`
      )
      console.log('✅ Email activation envoyé à:', emailTo)
    } catch (emailErr) {
      console.error('❌ Email activation error:', emailErr)
    }
  } else {
    console.warn('⚠️ Pas d\'email trouvé pour userId:', userId)
  }

  return user
}

  /**
   * REJET : Refuser une inscription
   */
  async rejectUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isValid: false, status: 'REJETE' as any }
    });

    await this.prisma.notification.create({
      data: {
        userId: userId,
        message: "Votre demande d'accès a été refusée.",
        type: 'REJECTION' as any,
        isRead: false,
      }
    });

    return user;
  }

  /**
   * UTILITAIRES : Email et Notifications Admin
   */
  async sendEmail(email: string, subject: string, html: string, text: string) {
    const sendSMTPemail = {
      to: [{ email }],
      sender: { email: process.env.SMTP_ADMIN_EMAIL as string },
      textContent: text,
      subject: subject,
      htmlContent: html
    };
    return await sendEmail_SendinBlue(sendSMTPemail);
  }

  private async notifyAdminsNewUser(newUser: any) {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          OR: [{ roles: { has: 'admin' } }, { userRole: 'ADMIN' }],
        },
        select: { id: true }
      });

      await Promise.all(
        admins.map(admin =>
          this.prisma.notification.create({
            data: {
              userId: admin.id,
              createdById: newUser.id,
              message: `Nouvel utilisateur en attente : ${newUser.username}`,
              type: 'ACTIVATION' as any,
              isRead: false,
            }
          })
        )
      );
    } catch (err) {
      console.error('Notification admin error:', err);
    }
  }

  // --- Méthodes de mot de passe restant inchangées mais nettoyées ---

  async sendEmailToResetPassword(credential: EmailResetPasswordCredential) {
    const supabase = createClient(process.env.KONG_URL!, process.env.SERVICE_ROLE_KEY!);
    return await supabase.auth.api.resetPasswordForEmail(credential.email, {
        redirectTo: `${process.env.SITE_URL}/auth/password-reset`
    });
  }

  async resetPassword(credentials: ResetPasswordCredential) {
    const supabase = createClient(process.env.KONG_URL!, process.env.SERVICE_ROLE_KEY!);
    return await supabase.auth.api.updateUser(credentials.access_token, {
        password: credentials.password
    });
  }
  async changeEmail(credentials: ResetEmailCredential) {
  }
}