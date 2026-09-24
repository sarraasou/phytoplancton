import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { Logger } from "winston";
import { DbService } from "src/dbService/db.service";
import { AiModelServiceBase } from "./base/aiModel.service.base";

@Injectable()
export class AiModelService extends AiModelServiceBase {
  constructor(
    protected readonly prisma: DbService,
    protected readonly logger: Logger
  ) {
    super(prisma, logger);
  }
}
