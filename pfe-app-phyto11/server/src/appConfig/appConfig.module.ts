import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { AppConfigModuleBase } from "./base/appConfig.module.base";
import { AppConfigService } from "./appConfig.service";
import { AppConfigController } from "./appConfig.controller";

@Module({
  imports: [AppConfigModuleBase],
  controllers: [AppConfigController],
  providers: [AppConfigService, DbService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
