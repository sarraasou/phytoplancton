import { Module } from '@nestjs/common'
import { PrismaModule } from 'nestjs-prisma' // ✅ Importer PrismaModule
import { ProjectPermissionService } from './project-permission.service'
import { ProjectPermissionController } from './Project-permission.Controller'
import { DbService } from 'src/dbService/db.service'

@Module({
  imports: [
    PrismaModule, // ✅ IMPORTANT: Importer PrismaModule
  ],
  controllers: [ProjectPermissionController],
  providers: [ProjectPermissionService ,DbService],
  exports: [ProjectPermissionService],
})
export class ProjectPermissionModule {}