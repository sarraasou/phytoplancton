import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Req, UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AllowAllGuard } from 'src/allowGuard'
import { NotificationService } from './notification.service'
import { DbService } from 'src/dbService/db.service'

@ApiTags('notifications')
@Controller('notification')
@UseGuards(AllowAllGuard)
export class NotificationController {
  constructor(
    private readonly notifService: NotificationService,
    private readonly prisma: DbService,
  ) {}

  // ═══════════════════════════════════════════════════════════════
  //  LECTURE
  // ═══════════════════════════════════════════════════════════════

  @Get('me')
  async getMyNotifications(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) return []
    return this.notifService.getForUser(userId)
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) return { count: 0 }
    const count = await this.notifService.countUnread(userId)
    return { count }
  }

  @Get('sent')
  async getSentNotifications(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) return []
    return this.notifService.getSentByUser(userId)
  }

  // ═══════════════════════════════════════════════════════════════
  //  ALERTES BLOOM (avec limite 7 jours + déduplication)
  // ═══════════════════════════════════════════════════════════════

  @Get('bloom-alerts')
  async getBloomAlerts(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) return []

    const since = new Date()
    since.setDate(since.getDate() - 7)

    const alerts = await this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null,
        type: 'CLASSIFICATION',
        isRead: false,
        createdAt: { gte: since },
        message: { contains: 'ALERTE BLOOM' },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Dédoublonner par projectId (garder la plus récente)
    const uniqueMap = new Map<string, any>()
    for (const n of alerts) {
      const projId = n.projectId || ''
      if (!uniqueMap.has(projId)) {
        const pctMatch = n.message.match(/(\d+(?:\.\d+)?)%/)
        const speciesMatch = n.message.match(/%\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/)
        // Regex pour extraire "10 cellules sur 150"
        const cellsMatch = n.message.match(/(\d+)\s+cellules?\s+sur\s+(\d+)/)
        const projMatch = n.message.match(/"([^"]+)"/)
        const speciesName = speciesMatch?.[1]?.includes('Alexandrium') ? 'Alexandrium' : 'Karenia'

        uniqueMap.set(projId, {
          projectId: n.projectId || '',
          projectTitle: projMatch?.[1] || 'Projet inconnu',
          speciesName,
          percentage: parseFloat(pctMatch?.[1] || '0'),
          kareniaCells: cellsMatch ? parseInt(cellsMatch[1]) : 0,
          alertCells: cellsMatch ? parseInt(cellsMatch[1]) : 0,
          totalCells: cellsMatch ? parseInt(cellsMatch[2]) : 0,
          severity: (parseFloat(pctMatch?.[1] || '0') >= 60) ? 'BLOOM_CRITICAL' : 'BLOOM_HIGH',
          detectedAt: n.createdAt.toISOString(),
          notifId: n.id,
        })
      }
    }
    return Array.from(uniqueMap.values())
  }

  @Post('bloom-alert/read')
  async markBloomAlertAsRead(@Body() body: { projectId: string }, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) throw new Error('Non authentifié')

    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        projectId: body.projectId,
        type: 'CLASSIFICATION',
        isRead: false,
        message: { contains: 'ALERTE BLOOM' },
      },
      data: { isRead: true },
    })
    return { updated: result.count }
  }

  // ═══════════════════════════════════════════════════════════════
  //  MODIFICATION
  // ═══════════════════════════════════════════════════════════════

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    if (!userId) return { updated: 0 }
    return this.notifService.markAllAsRead(userId)
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    })
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notifService.delete(id)
  }

  // ═══════════════════════════════════════════════════════════════
  //  NOTIFICATIONS MÉTIER
  // ═══════════════════════════════════════════════════════════════

  @Post('notify-bloom-alert')
  async notifyBloomAlert(@Body() dto: any, @Req() req: any) {
    const { bloomPercentage, severityLevel, projectId, projectTitle, totalCells } = dto
    const userId = req.user?.sub || req.user?.id
    const speciesName = dto.speciesName === 'Alexandrium' ? 'Alexandrium' : 'Karenia Selliformis'
    const alertCells = Number(dto.alertCells ?? dto.kareniaCells ?? dto.alexandriumCells ?? 0)

    const severity = bloomPercentage >= 60 ? 'BLOOM_CRITICAL' : 'BLOOM_HIGH'
    const icon = severity === 'BLOOM_CRITICAL' ? '🔴' : '🟠'
    const level = severity === 'BLOOM_CRITICAL' ? 'CRITIQUE' : 'ÉLEVÉ'

    // Message incluant le total des cellules
    const message = `${icon} ALERTE BLOOM ${level} dans "${projectTitle}" — ${Number(bloomPercentage).toFixed(1)}% ${speciesName} (${alertCells} cellules sur ${totalCells}). Niveau : ${severityLevel}.`

    // Vérifier s'il existe une alerte récente (24h) pour ce projet
    const existing = await this.prisma.notification.findFirst({
      where: {
        projectId: projectId || null,
        type: 'CLASSIFICATION',
        message: { contains: 'ALERTE BLOOM' },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      const existingPct = parseFloat(existing.message.match(/(\d+(?:\.\d+)?)%/)?.[1] || '0')
      if (bloomPercentage <= existingPct) {
        console.log(`Alerte ignorée pour ${projectTitle} (${bloomPercentage}% ≤ ${existingPct}%)`)
        return { sent: 0, reason: 'duplicate' }
      }
    }

    const targets = await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        userRole: { in: ['ADMIN', 'EXPERT'] },
      },
      select: { id: true },
    })

    await this.prisma.notification.createMany({
      data: targets.map(u => ({
        userId: u.id,
        createdById: userId || null,
        message,
        type: 'CLASSIFICATION',
        projectId: projectId || null,
        isRead: false,
      })),
    })

    return { sent: targets.length }
  }

  @Post('notify-analysis')
  async notifyAfterAnalysis(@Body() body: any, @Req() req: any) {
    const { projectId, projectTitle, imageCount } = body
    const userId = req.user?.sub || req.user?.id
    if (!userId) return { sent: 0 }

    await this.prisma.notification.create({
      data: {
        userId,
        message: `🔬 Analyse IA terminée sur "${projectTitle}" — ${imageCount} image(s) traitée(s).`,
        type: 'CLASSIFICATION',
        projectId: projectId || null,
        isRead: false,
      },
    })
    return { sent: 1 }
  }

  @Post('notify-validation')
  async notifyValidation(@Body() body: any, @Req() req: any) {
    const { projectId, projectTitle, annotationCount } = body
    const userId = req.user?.sub || req.user?.id
    if (!userId) return { sent: 0 }

    await this.prisma.notification.create({
      data: {
        userId,
        message: `✅ ${annotationCount} annotation(s) validée(s) sur "${projectTitle}".`,
        type: 'VALIDATION',
        projectId: projectId || null,
        isRead: false,
      },
    })
    return { sent: 1 }
  }

  @Post('notify-new-project')
  async notifyNewProject(@Body() body: any, @Req() req: any) {
    const { projectId, projectTitle } = body
    const userId = req.user?.sub || req.user?.id
    if (!userId) return { sent: 0 }

    await this.prisma.notification.create({
      data: {
        userId,
        message: `📁 Nouveau projet créé : "${projectTitle}".`,
        type: 'CLASSIFICATION',
        projectId: projectId || null,
        isRead: false,
      },
    })
    return { sent: 1 }
  }
}
