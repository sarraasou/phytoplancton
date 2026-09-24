// server/src/auth/user-data.decorator.ts  ← créer ce fichier
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserData = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)