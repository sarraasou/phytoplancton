import { Module }                from '@nestjs/common'
import { PrismaModule }          from 'nestjs-prisma'
import { NotificationController } from './notification.controller'
import { NotificationService }    from './notification.service'
import { DbService }             from '../dbService/db.service'  // ✅ DbService pour accès à la DB

@Module({
  imports:     [PrismaModule],
  controllers: [NotificationController],
  providers:   [NotificationService, DbService],  // ✅ DbService injecté pour accès à la DB
  exports:     [NotificationService],  // ✅ exporté pour usage dans AuthService si besoin
})
export class NotificationModule {}