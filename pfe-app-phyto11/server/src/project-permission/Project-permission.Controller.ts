// src/project-permission/project-permission.controller.ts

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { ProjectPermissionService } from './project-permission.service'
import { AllowAllGuard } from 'src/allowGuard'

@ApiTags('project-permission')
@Controller('project-permission')
@UseGuards(AllowAllGuard)
export class ProjectPermissionController {
  constructor(private readonly permService: ProjectPermissionService) {}

  // ═══════════════════════════════════════════════════════════════
  // 1. ROUTES FIXES (déclarées en premier)
  // ═══════════════════════════════════════════════════════════════

  @Post('grant')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accorder des permissions (admin)' })
  async grant(@Body() body: any, @Req() req: any) {
    const adminId = req.user?.sub || req.user?.id
    if (!adminId) throw new Error('Non authentifié')
    return this.permService.grantPermissions({ ...body, grantedById: adminId })
  }

  // GET /project-permission/my-projects
  @Get('my-projects')
  @ApiOperation({ summary: 'Projets accessibles par l\'utilisateur authentifié' })
  async getMyOwnProjects(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié')
    return this.permService.getProjectsWithAccess(userId)
  }

  // GET /project-permission/my-projects/:projectId
  @Get('my-projects/:projectId')
  @ApiOperation({ summary: "Permissions de l'utilisateur courant sur un projet" })
  async getMyProjectPermissions(@Param('projectId') projectId: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) throw new UnauthorizedException('Utilisateur non authentifié')
    return this.permService.getPermissions(userId, projectId)
  }

  // GET /project-permission/:projectId/count
  @Get(':projectId/count')
  @ApiOperation({ summary: "Nombre d'utilisateurs avec accès" })
  async countUsers(@Param('projectId') projectId: string) {
    const users = await this.permService.listProjectUsers(projectId)
    return { count: users.length }
  }

  // GET /project-permission/:projectId/users
  @Get(':projectId/users')
  @ApiOperation({ summary: 'Liste des utilisateurs avec accès' })
  async listUsers(@Param('projectId') projectId: string) {
    return this.permService.listProjectUsers(projectId)
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. ROUTES DYNAMIQUES (en dernier)
  // ═══════════════════════════════════════════════════════════════

  @Get(':projectId/:userId')
  @ApiOperation({ summary: "Permissions d'un utilisateur sur un projet" })
  async getPerms(@Param('projectId') projectId: string, @Param('userId') userId: string) {
    return this.permService.getPermissions(userId, projectId)
  }

  @Delete(':projectId/:userId')
  @ApiOperation({ summary: 'Révoquer les permissions' })
  async revoke(@Param('projectId') projectId: string, @Param('userId') userId: string, @Req() req: any) {
    const adminId = req.user?.sub || req.user?.id
    if (!adminId) throw new Error('Non authentifié')
    return this.permService.revokePermissions(projectId, userId, adminId)
  }
}