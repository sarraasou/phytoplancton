import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { CollaboratorModuleBase } from "./base/collaborator.module.base";
import { CollaboratorService } from "./collaborator.service";
import { CollaboratorController } from "./collaborator.controller";

@Module({
  imports: [CollaboratorModuleBase],
  controllers: [CollaboratorController],
  providers: [CollaboratorService, DbService],
  exports: [CollaboratorService],
})
export class CollaboratorModule {}
