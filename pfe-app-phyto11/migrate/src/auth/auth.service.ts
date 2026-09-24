import { Injectable, UnauthorizedException, BadRequestException } from "@nestjs/common";
// @ts-ignore
// eslint-disable-next-line
import { UserService } from "../user/user.service";
import { Credentials, ResetEmailCredential } from "./Credentials";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { UserInfo, User, ApiError } from "./UserInfo";
import { EmailResetPasswordCredential, ResetPasswordCredential, UserCredentials, InviteUserByEmailCredential } from "./Credentials";
import axios from 'axios';
import { createClient } from '@supabase/supabase-js'
import { PrismaService } from 'nestjs-prisma';
// @ts-ignore
import { sendEmail_SendinBlue } from 'src/util/sendEmail';


// this function will add connect to any child object that have 'id' property & remove any property that have null or empty value
function transformUserData(obj: any): any {
  const updatedObj: any = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "object" && value !== null) {
      if ("id" in value && value.id !== null && value.id !== "") {
        updatedObj[key] = { connect: { id: value.id } };
      } else {
        const transformedValue = transformUserData(value);
        if (Object.keys(transformedValue).length > 0) {
          updatedObj[key] = transformedValue;
        }
      }
    } else if (value !== null && value !== "") {
      updatedObj[key] = value;
    }
  }

  return updatedObj;
}


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    protected readonly prisma: PrismaService,
  ) { }

  async validateUser(
    username: string,
    password: string
  ): Promise<UserInfo | null> {
    const user = await this.userService.findOne({
      where: { username },
    });
    if (user && user.username == username) {
      const { roles } = user;
      return { username, roles };
    }
    return null;
  }


  async supabaseLogin(credentials: Credentials) {
    credentials.email = credentials.email.toLowerCase();
    const { data } = await axios.post(
      process.env.KONG_URL + "/auth/v1/token?grant_type=password",
      {
        email: credentials.email,
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
  }

  async signUp(credentials: UserCredentials): Promise<User | ApiError> {
    if (credentials.role?.toLowerCase() === "service_role" || credentials.role?.toLowerCase() === "admin" || credentials.role?.toLowerCase() === "super-admin") {
      throw new UnauthorizedException(`You can't sign up with the role ${credentials.role}`);
    }
    credentials.email = credentials.email.toLowerCase();
    return await axios.post((process.env.KONG_URL || '') + '/auth/v1/admin/users',
      credentials,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SERVICE_ROLE_KEY || ''}`
        }
      })
      .then(async response => {
        const authData = await this.supabaseLogin({ email: credentials.email, password: credentials.password });
        return authData;
      })
      .catch(error => {
        return error.response.data;
      });
  }

  async sendEmailToResetPassword(credential: EmailResetPasswordCredential) {
    const supabase = createClient('http://kong:8000', process.env.SERVICE_ROLE_KEY || '')

    const redirectTo = process.env.SITE_URL + '/auth/password-reset';
    const { data, error } = await supabase.auth.api
      .resetPasswordForEmail(credential.email, {
        redirectTo
      })
    if (data) {
      return data;
    } else {
      return error;
    }
  }

  async sendEmail(email: string, emailSubject: string, emailHtmlContent: string, emailTextContent: string) {
    var sendSMTPemail = {
      to: [{
        email: email,
      }],
      sender: {
        email: process.env.SMTP_ADMIN_EMAIL as string,
      },
      textContent: emailTextContent,
      subject: emailSubject,
      htmlContent: emailHtmlContent
    };

    const transport = await sendEmail_SendinBlue(sendSMTPemail)
    return transport;
  }

async inviteUserByEmail(credential: InviteUserByEmailCredential) {
  // 1. Vérification de l'existence (On check l'email en minuscule pour éviter les doublons)
  const targetEmail = credential.email.toLowerCase().trim();
  
  const userExist = await this.prisma.user.findFirst({ 
    where: { username: targetEmail } 
  });

  if (userExist) {
    throw new BadRequestException("L'utilisateur existe déjà dans le système.");
  }

  // 2. Initialisation Supabase Admin
  const supabase = createClient(
    process.env.KONG_URL || "http://kong:8000",
    process.env.SERVICE_ROLE_KEY || ""
  );

  const redirectTo = process.env.SITE_URL + '/auth/password-reset';

  // 3. Génération du lien d'invitation
  const { data, error: supabaseError } = await supabase.auth.api.generateLink(
    'invite',
    targetEmail,
    {
      redirectTo: credential.options?.redirectTo || redirectTo,
      data: credential.options?.data // Metadata (firstName, lastName, etc.)
    }
  );

  if (supabaseError || !data) {
    console.error("Erreur Supabase Invite:", supabaseError);
    throw new BadRequestException(supabaseError?.message || "Erreur lors de la génération du lien Supabase");
  }

  const actionLinkData = data as any;

  // 4. Mise à jour ou Création dans Prisma
  // On utilise "upsert" ou on s'assure que le record existe pour attacher les rôles
// --- 4. Mise à jour ou Création dans Prisma ---
try {
  // On transforme les données (firstName, lastName, etc.)
  const userPublicData = transformUserData(credential.options?.data);

  // On utilise DIRECTEMENT this.prisma au lieu de this.userService
  await this.prisma.user.upsert({
    where: { username: targetEmail },
    update: {
      ...userPublicData,
      roles: { set: ["user"] }, // Mise à jour des rôles si l'user existe
    },
    create: {
      ...userPublicData,
      username: targetEmail,
      roles: ["user"], // Création de l'user s'il n'existe pas
    },
  });
  console.log("Utilisateur synchronisé avec succès dans Prisma.");
} catch (prismaError: any) {
  // Si ça échoue ici, on log l'erreur mais on continue pour essayer d'envoyer l'email
  console.error("Prisma Upsert Error:", prismaError.message);
}
  // 5. Envoi de l'email via SendinBlue
  try {
    const appName = process.env.APP_NAME || 'Notre Plateforme';
    const subject = `Rejoignez ${appName}`;
    const textContent = `Bonjour, vous êtes invité à rejoindre ${appName}. Cliquez ici : ${actionLinkData.action_link}`;
    const htmlContent = `
      <div style="font-family: sans-serif;">
        <h1>Bonjour,</h1>
        <p>Vous avez été invité à nous rejoindre sur la plateforme <strong>${appName}</strong>.</p>
        <p><a href="${actionLinkData.action_link}" style="padding: 10px 20px; background: #0077b6; color: white; text-decoration: none; border-radius: 5px;">Activer mon compte</a></p>
        <small>Si le bouton ne fonctionne pas, copiez ce lien : ${actionLinkData.action_link}</small>
      </div>`;

    return await this.sendEmail(targetEmail, subject, htmlContent, textContent);
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    // On ne throw pas forcément une erreur ici car le compte est déjà créé dans Supabase
    return { message: "User invited, but email failed to send", link: actionLinkData.action_link };
  }
}

  async resetPassword(credentials: ResetPasswordCredential) {
    const supabase = createClient('http://kong:8000', process.env.SERVICE_ROLE_KEY || "")
    const { data, error } = await supabase.auth.api
      .updateUser(credentials.access_token, {
        password: credentials.password
      })
    if (data) {
      return data;
    } else {
      return error;
    }
  }

  async changeEmail(credentials: ResetEmailCredential) {
    const supabase = createClient('http://kong:8000', process.env.SERVICE_ROLE_KEY || "")
    // to check for password
    const user = await this.userService.findOne({
      where: { id: credentials.userId },
      select: {
        username: true,
      },
    });
    // to check for email availbility
    const userWithSameNewEmail = await this.userService.findOne({
      where: { username: credentials.email },
      select: {
        username: true,
      },
    });
    if (userWithSameNewEmail) throw new BadRequestException("Email already used!");
    if (user && credentials.password) {
      const validPassword = await this.passwordService.compare(
        credentials.password!,
        user.username!
      );
      if (validPassword) {
        // update email 
        const { data, error } = await supabase.auth.api.updateUserById(credentials.userId, { email: credentials.email, user_metadata: { username: credentials.email } })
        if (data) {
          return data;
        } else {
          return error;
        }
      } else throw new BadRequestException("Wrong password");
    } else throw new BadRequestException("Coudn't find user");
  }
}
