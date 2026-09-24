import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { AnnotationModuleBase } from "./base/annotation.module.base";
import { AnnotationService } from "./annotation.service";
import { AnnotationController } from "./annotation.controller";

@Module({
  imports: [AnnotationModuleBase],
  controllers: [AnnotationController],
  providers: [AnnotationService, DbService],
  exports: [AnnotationService],
})
export class AnnotationModule {}
