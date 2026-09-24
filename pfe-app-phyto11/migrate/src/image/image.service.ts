import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { Logger } from "winston";
import { DbService } from "src/dbService/db.service";
import { ImageServiceBase } from "./base/image.service.base";

@Injectable()
export class ImageService extends ImageServiceBase {
  constructor(
    protected readonly prisma: DbService,
    protected readonly logger: Logger
  ) {
    super(prisma, logger);
  }
}
