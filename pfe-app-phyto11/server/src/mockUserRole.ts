// src/mockUserRole.ts  ← même nom, même fichier, comportement corrigé
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const MockUserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest()
    const user    = request.user        // ✅ injecté par JwtAuthGuard

    if (!user) return []

    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return user.roles
    }
    if (user.userRole) {
      return [user.userRole]
    }
    return []
  },
)