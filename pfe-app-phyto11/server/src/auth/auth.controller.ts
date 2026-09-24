import {
  Controller, Post, Body, Get, Render,
  Patch, Param, ForbiddenException, UseGuards
} from "@nestjs/common"
import { ApiTags }     from "@nestjs/swagger"
import { AuthService } from "./auth.service"
import { AllowAllGuard } from 'src/allowGuard'
import { MockUserRoles } from 'src/mockUserRole'
import { ApiError, User, UserInfo } from "./UserInfo"
import {
  Credentials, EmailResetPasswordCredential,
  ResetPasswordCredential, UserCredentials,
  InviteUserByEmailCredential, ResetEmailCredential
} from "./Credentials"

@ApiTags("auth")
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ✅ Helper privé
  private isAdmin(roles: string[]): boolean {
    return roles.some(r =>
      r.toLowerCase() === 'admin' ||
      r.toUpperCase() === 'ADMIN'
    )
  }

  // ─── Routes PUBLIQUES ────────────────────────────────

  @Post('sign_up')
  async signUp(@Body() body: UserCredentials): Promise<User | ApiError> {
    return await this.authService.signUp(body)
  }

  @Post('sign_in')
  async signIn(@Body() body: Credentials): Promise<UserInfo | ApiError> {
    return await this.authService.supabaseLogin(body)
  }

  @Get("template_email_recovery")
  @Render('template_email_recovery.hbs')
  root() {
    return { url: "{{ .ConfirmationURL }}" }
  }

  @Post('send_email_reset_password')
  async sendEmailResetPassword(@Body() body: EmailResetPasswordCredential) {
    return await this.authService.sendEmailToResetPassword(body)
  }

  @Post('reset_password')
  async resetPassword(@Body() body: ResetPasswordCredential) {
    return await this.authService.resetPassword(body)
  }

  @Post('change_email')
  async changeEmail(@Body() body: ResetEmailCredential) {
    return await this.authService.changeEmail(body)
  }

  // ─── Routes ADMIN SEULEMENT ──────────────────────────

  @Post('invite_user_by_email')
  @UseGuards(AllowAllGuard)
  async inviteUserByEmail(
    @Body() body: InviteUserByEmailCredential,
    @MockUserRoles() userRoles: string[],
  ) {
    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException(
        'Seul un administrateur peut inviter des utilisateurs'
      )
    }
    return await this.authService.inviteUserByEmail(body)
  }

  @Patch('activate_user/:id')
  @UseGuards(AllowAllGuard)
  async activateUser(
    @Param('id') id: string,
    @MockUserRoles() userRoles: string[],
  ) {
    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException(
        'Seul un administrateur peut activer un compte'
      )
    }
    return await this.authService.activateUser(id)
  }

  @Patch('reject_user/:id')
  @UseGuards(AllowAllGuard)
  async rejectUser(
    @Param('id') id: string,
    @MockUserRoles() userRoles: string[],
  ) {
    if (!this.isAdmin(userRoles)) {
      throw new ForbiddenException(
        'Seul un administrateur peut refuser un compte'
      )
    }
    return await this.authService.rejectUser(id)
  }
}