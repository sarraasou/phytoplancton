import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { AiModelModuleBase } from "./base/aiModel.module.base";
import { AiModelService } from "./aiModel.service";
import { AiModelController } from "./aiModel.controller";

@Module({
  imports: [AiModelModuleBase],
  controllers: [AiModelController],
  providers: [AiModelService, DbService],
  exports: [AiModelService],
})
export class AiModelModule {}
