import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { ProjectModuleBase } from "./base/project.module.base";
import { ProjectService } from "./project.service";
import { ProjectController } from "./project.controller";
import { ProjectPermissionModule } from '../project-permission/project-permission.module'  // ← AJOUTER


@Module({
  imports: [ProjectModuleBase,ProjectPermissionModule],
  controllers: [ProjectController],
  providers: [ProjectService, DbService],
  exports: [ProjectService],
})
export class ProjectModule {}
