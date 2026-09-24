import { Module } from "@nestjs/common";
import { DbService } from "src/dbService/db.service";
import { ImageModuleBase } from "./base/image.module.base";
import { ImageService } from "./image.service";
import { ImageController } from "./image.controller";

@Module({
  imports: [ImageModuleBase],
  controllers: [ImageController],
  providers: [ImageService, DbService],
  exports: [ImageService],
})
export class ImageModule {}
