import { Injectable, NotFoundException } from '@nestjs/common'
import { DbService } from '../dbService/db.service'
import { NotificationType } from '@prisma/client'

@Injectable()
export class NotificationService {

  constructor(private readonly prisma: DbService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // LECTURE
  // ═══════════════════════════════════════════════════════════════════════════

  async getForUser(userId: string) {
    return this.prisma.notification.findMany({
      where:   { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take:    30,
    })
  }

  async getSentByUser(userId: string) {
    return this.prisma.notification.findMany({
      where:   { createdById: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take:    30,
    })
  }

  async countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false, deletedAt: null },
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  async markAsRead(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } })
    if (!notif) throw new NotFoundException(`Notification ${id} not found`)
    return this.prisma.notification.update({
      where: { id },
      data:  { isRead: true },
    })
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data:  { isRead: true },
    })
  }

  async delete(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } })
    if (!notif) throw new NotFoundException(`Notification ${id} not found`)
    return this.prisma.notification.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CRÉATION
  // ═══════════════════════════════════════════════════════════════════════════

  async create(data: {
    userId:       string
    message:      string
    type?:        NotificationType
    createdById?: string
    projectId?:   string
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        type: data.type ?? NotificationType.ACTIVATION,
      },
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION PAR RÔLE
  // ═══════════════════════════════════════════════════════════════════════════

  async notifyByRole(
    role:            string,
    message:         string,
    type:            NotificationType,
    createdById?:    string,
    projectId?:      string,
    excludeUserId?:  string
  ) {
    // Recherche des utilisateurs par rôle (insensible à la casse)
    const roleVariants = [
      role,
      role.toUpperCase(),
      role.toLowerCase(),
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
    ]

    const users = await this.prisma.user.findMany({
      where: {
        OR: roleVariants.map(r => ({ userRole: r })),
        isValid: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    })

    if (users.length === 0) return

    await Promise.all(
      users.map(u =>
        this.create({ userId: u.id, message, type, createdById, projectId })
      )
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATION ADMINS
  // ═══════════════════════════════════════════════════════════════════════════

  async notifyAllAdmins(
    message:      string,
    type:         NotificationType = NotificationType.ACTIVATION,
    createdById?: string
  ) {
    await this.notifyByRole('ADMIN', message, type, createdById)
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOOM ALERT
  // ═══════════════════════════════════════════════════════════════════════════

  async notifyAdminsBloomAlert(dto: {
    bloomPercentage?: number
    severityLevel?:   string
    projectId?:       string
    projectTitle?:    string
    imageCount?:      number
    kareniaCells?:    number
  }) {
    const percentage = dto.bloomPercentage ?? 0
    const severity   = dto.severityLevel   ?? 'BLOOM_ALERT'
    const project    = dto.projectTitle    || 'Inconnu'

    const icon =
      severity === 'BLOOM_CRITICAL' ? '🔴' :
      severity === 'BLOOM_HIGH'     ? '🚨' : '⚠️'

    const message =
      `${icon} ALERTE BLOOM dans "${project}" — ` +
      `${percentage.toFixed(1)}% Karenia Selliformis` +
      (dto.kareniaCells ? ` (${dto.kareniaCells} cellules)` : '') +
      `. Niveau : ${severity}.`

    await this.notifyByRole(
      'ADMIN', message, NotificationType.CLASSIFICATION, undefined, dto.projectId
    )
    await this.notifyByRole(
      'EXPERT', message, NotificationType.CLASSIFICATION, undefined, dto.projectId
    )
  }
}