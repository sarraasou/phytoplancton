// src/allowGuard.ts  ← même nom, même fichier, comportement corrigé
import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AllowAllGuard extends AuthGuard('jwt') {  // ✅ hérite du vrai guard
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)                  // ✅ vérifie le token JWT
  }
}