// src/project-permission/project-permission.service.ts

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { DbService } from '../dbService/db.service'

@Injectable()
export class ProjectPermissionService {
  constructor(private readonly prisma: DbService) {}

  // ─────────────────────────────────────────────────────────────
  // DONNER DES PERMISSIONS (Admin seulement)
  // ─────────────────────────────────────────────────────────────
  async grantPermissions(data: {
    projectId: string
    userId: string
    grantedById: string
    canView?: boolean
    canUpload?: boolean
    canAnnotate?: boolean
    canValidate?: boolean
    canEdit?: boolean
    canDelete?: boolean
    expiresAt?: Date
  }) {
    const [project, user, granter] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: data.projectId } }),
      this.prisma.user.findUnique({ where: { id: data.userId } }),
      this.prisma.user.findUnique({ where: { id: data.grantedById } }),
    ])

    if (!project) throw new NotFoundException('Projet non trouvé')
    if (!user) throw new NotFoundException('Utilisateur non trouvé')
    if (granter?.userRole?.toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Seul un Admin peut donner des permissions')
    }

    return this.prisma.projectPermission.upsert({
      where: {
        projectId_userId: { projectId: data.projectId, userId: data.userId },
      },
      create: {
        projectId: data.projectId,
        userId: data.userId,
        grantedById: data.grantedById,
        canView: data.canView ?? false,
        canUpload: data.canUpload ?? false,
        canAnnotate: data.canAnnotate ?? false,
        canValidate: data.canValidate ?? false,
        canEdit: data.canEdit ?? false,
        canDelete: data.canDelete ?? false,
        expiresAt: data.expiresAt,
        isActive: true,
      },
      update: {
        canView: data.canView,
        canUpload: data.canUpload,
        canAnnotate: data.canAnnotate,
        canValidate: data.canValidate,
        canEdit: data.canEdit,
        canDelete: data.canDelete,
        expiresAt: data.expiresAt,
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, userRole: true },
        },
        project: {
          select: { id: true, title: true },
        },
      },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // LIRE LES PERMISSIONS d'un user sur un projet
  // ─────────────────────────────────────────────────────────────
  async getPermissions(userId: string, projectId: string) {
    const [user, project] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.project.findUnique({ where: { id: projectId } }),
    ])

    if (user?.userRole?.toUpperCase() === 'ADMIN') {
      return {
        canView: true,
        canUpload: true,
        canAnnotate: true,
        canValidate: true,
        canEdit: true,
        canDelete: true,
        isAdmin: true,
      }
    }

    if (project?.userId === userId) {
      return {
        canView: true,
        canUpload: true,
        canAnnotate: true,
        canValidate: true,
        canEdit: true,
        canDelete: true,
        isOwner: true,
      }
    }

    const perm = await this.prisma.projectPermission.findUnique({
      where: { projectId_userId: { projectId, userId } },
    })

    if (!perm || perm.isActive === false) {
      return {
        canView: false,
        canUpload: false,
        canAnnotate: false,
        canValidate: false,
        canEdit: false,
        canDelete: false,
      }
    }

    if (perm.expiresAt && perm.expiresAt < new Date()) {
      return {
        canView: false,
        canUpload: false,
        canAnnotate: false,
        canValidate: false,
        canEdit: false,
        canDelete: false,
        expired: true,
      }
    }

    return {
      canView: perm.canView,
      canUpload: perm.canUpload,
      canAnnotate: perm.canAnnotate,
      canValidate: perm.canValidate,
      canEdit: perm.canEdit,
      canDelete: perm.canDelete,
    }
  }

  // ─────────────────────────────────────────────────────────────
  // VÉRIFIER UNE PERMISSION SPÉCIFIQUE
  // ─────────────────────────────────────────────────────────────
  async requirePermission(
    userId: string,
    projectId: string,
    permission: 'canView' | 'canUpload' | 'canAnnotate' | 'canValidate' | 'canEdit' | 'canDelete',
    message?: string,
  ) {
    const perms = await this.getPermissions(userId, projectId)
    if (!perms[permission]) {
      throw new ForbiddenException(
        message || `Vous n'avez pas la permission "${permission}" sur ce projet`,
      )
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RÉVOQUER les permissions
  // ─────────────────────────────────────────────────────────────
  async revokePermissions(projectId: string, userId: string, revokedById: string) {
    const revoker = await this.prisma.user.findUnique({ where: { id: revokedById } })
    if (revoker?.userRole?.toUpperCase() !== 'ADMIN') {
      throw new ForbiddenException('Seul un Admin peut révoquer des permissions')
    }
    return this.prisma.projectPermission.updateMany({
      where: { projectId, userId },
      data: { isActive: false, updatedAt: new Date() },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // LISTER les utilisateurs avec permissions sur un projet
  // ─────────────────────────────────────────────────────────────
  async listProjectUsers(projectId: string) {
    return this.prisma.projectPermission.findMany({
      where: { projectId, isActive: true },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, userRole: true },
        },
        grantedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ─────────────────────────────────────────────────────────────
  // BULK GRANT
  // ─────────────────────────────────────────────────────────────
  async bulkGrantPermissions(
    projectId: string,
    permissions: Array<{
      userId: string
      canView?: boolean
      canUpload?: boolean
      canAnnotate?: boolean
      canValidate?: boolean
      canEdit?: boolean
      canDelete?: boolean
    }>,
    grantedById: string,
  ) {
    const results = await Promise.allSettled(
      permissions.map(perm =>
        this.grantPermissions({ projectId, grantedById, ...perm }),
      ),
    )
    return results.map((r, i) =>
      r.status === 'fulfilled'
        ? { success: true, data: r.value }
        : { success: false, userId: permissions[i].userId, error: r.reason?.message ?? 'Erreur' },
    )
  }

  // ─────────────────────────────────────────────────────────────
  // PROJETS + PERMISSIONS pour un utilisateur (endpoint /my-projects)
  // Version corrigée – plus d'erreurs TypeScript
  // ─────────────────────────────────────────────────────────────
  async getProjectsWithAccess(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Utilisateur non trouvé')

    // ADMIN : tous les projets non supprimés
    if (user.userRole?.toUpperCase() === 'ADMIN') {
      const projects = await this.prisma.project.findMany({
        where: { deletedAt: null },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          images: { where: { deletedAt: null }, select: { id: true, url: true, name: true } },
        },
      })
      return projects.map(p => ({
        project: p,
        canView: true,
        canUpload: true,
        canAnnotate: true,
        canValidate: true,
        canEdit: true,
        canDelete: true,
      }))
    }

    // Projets dont l'utilisateur est propriétaire
    const ownedProjects = await this.prisma.project.findMany({
      where: { userId, deletedAt: null },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        images: { where: { deletedAt: null }, select: { id: true, url: true, name: true } },
      },
    })

    // Permissions accordées (actives, non expirées, avec au moins un droit)
    const permissions = await this.prisma.projectPermission.findMany({
      where: {
        userId,
        isActive: true,
        OR: [
          { canView: true },
          { canUpload: true },
          { canAnnotate: true },
          { canValidate: true },
          { canEdit: true },
          { canDelete: true },
        ],
      },
      include: {
        project: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            images: { where: { deletedAt: null }, select: { id: true, url: true, name: true } },
          },
        },
      },
    })

    const result = new Map<string, any>()

    // Projets possédés → tous droits
    ownedProjects.forEach(p => {
      result.set(p.id, {
        project: p,
        canView: true,
        canUpload: true,
        canAnnotate: true,
        canValidate: true,
        canEdit: true,
        canDelete: true,
        isOwner: true,
      })
    })

    // Projets partagés → droits réels
    permissions.forEach(p => {
      if (!p.project) return
      if (p.expiresAt && p.expiresAt < new Date()) return
      if (!result.has(p.projectId)) {
        result.set(p.projectId, {
          project: p.project,
          canView: p.canView,
          canUpload: p.canUpload,
          canAnnotate: p.canAnnotate,
          canValidate: p.canValidate,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
        })
      }
    })

    return Array.from(result.values())
  }
}