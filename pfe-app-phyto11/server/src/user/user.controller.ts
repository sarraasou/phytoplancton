import * as common from '@nestjs/common'
import { Body, Param, Patch } from '@nestjs/common';
import * as swagger from '@nestjs/swagger'
import * as nestAccessControl from 'nest-access-control'
import { Request } from 'express'
import { plainToClass } from 'class-transformer'
import { Logger } from 'winston'
import { PasswordService } from 'src/auth/password.service'
import { AuthService } from 'src/auth/auth.service'
import { AllowAllGuard } from 'src/allowGuard'
import { MockUserRoles } from 'src/mockUserRole'
import { UserService } from './user.service'
import { UserControllerBase } from './base/user.controller.base'
import { UserFindManyArgs } from './base/UserFindManyArgs'
import { User } from './base/User'
import { PaginatedInterface } from '../util/PaginatedInterface'
import { getListUserDto } from './base/getListUser.dto'
import { DbService } from '../dbService/db.service'  // ✅ AJOUTÉ

@swagger.ApiTags('users')
@common.Controller('users')
@common.UseGuards(AllowAllGuard)
export class UserController extends UserControllerBase {

  constructor(
    protected readonly service: UserService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    protected readonly passwordService: PasswordService,
    protected readonly authService: AuthService,
    @common.Inject('winston')
    protected readonly logger: Logger,
    protected readonly prisma: DbService,  // ✅ AJOUTÉ
  ) {
    super(service, rolesBuilder, passwordService, authService, logger)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /users/me
  // ═══════════════════════════════════════════════════════════════════════════
  @common.Get('me')
  async getMe(@common.Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) throw new common.UnauthorizedException()
    return this.service.findOne({
      where: { id: userId },
      select: {
        id: true, email: true,
        firstName: true, lastName: true,
        userRole: true,
        isValid: true, status: true,
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /users/me/projects
  // Récupère tous les projets auxquels l'utilisateur a accès
  // ═══════════════════════════════════════════════════════════════════════════
// server/src/user/user.controller.ts

// src/user/user.controller.ts - au début de getMyProjects
@common.Get('me/projects')
async getMyProjects(@common.Req() req: any) {
  // 🔥 FORCER UNE ERREUR POUR CASSER LE CACHE
  console.log('🔥 NOUVEAU CODE EXÉCUTÉ - Version 2 !!!')
  
  const userId = req.user?.sub || req.user?.id
  if (!userId) throw new common.UnauthorizedException()

  const permissions = await this.prisma.projectPermission.findMany({
    where: { 
      userId: userId, 
      isActive: true 
    }
  })

  console.log('🔥 Permissions:', permissions.length)

  if (permissions.length === 0) {
    return []
  }

  const projectIds = permissions.map(p => p.projectId)

  const projects = await this.prisma.project.findMany({
    where: {
      id: { in: projectIds },
      deletedAt: null
    },
    include: {
      images: {
        where: { deletedAt: null },
        select: { id: true }
      }
    }
  })

  const projectMap = new Map()
  for (const project of projects) {
    projectMap.set(project.id, project)
  }

  const result = []
  for (const perm of permissions) {
    const project = projectMap.get(perm.projectId)
    if (project) {
      result.push({
        id: project.id,
        title: project.title,
        description: project.description,
        tool: project.tool,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        imagesCount: project.images?.length || 0,
        permissions: {
          canView: perm.canView,
          canEdit: perm.canEdit,
          canAnnotate: perm.canAnnotate,
          canValidate: perm.canValidate
        }
      })
    }
  }

  return result
}

  // ═══════════════════════════════════════════════════════════════════════════
  // GET /users
  // ═══════════════════════════════════════════════════════════════════════════
  @common.Get()
  @nestAccessControl.UseRoles({
    resource: 'User',
    action: 'read',
    possession: 'any',
  })
  @swagger.ApiOkResponse({ type: getListUserDto })
  @swagger.ApiForbiddenResponse()
  @swagger.ApiQuery({
    type: () => UserFindManyArgs,
    style: 'deepObject',
    explode: true,
  })
  async findMany(
    @common.Req() request: Request,
    @MockUserRoles() userRoles: string[],
  ): Promise<PaginatedInterface<User>> {

    const args = plainToClass(UserFindManyArgs, request.query)

    const permission = this.rolesBuilder.permission({
      role: userRoles,
      action: 'read',
      possession: 'any',
      resource: 'User',
    })

    const results = await this.service.findMany({
      ...args,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        isValid: true,
        roles: true,
        userRole: true,
        status: true,
        projects: {
          select: { id: true, title: true },
        },
        collaborators: {
          select: {
            id: true,
            project: { select: { id: true } },
          },
        },
        notifications: {
          select: {
            id: true,
            message: true,
            isRead: true,
            type: true,
            createdAt: true,
          },
          where: { isRead: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    const result = results.paginatedResult.map((item: User) =>
      permission.filter(item)
    )

    return { paginatedResult: result, totalCount: results.totalCount }
  }
}