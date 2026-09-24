import { Injectable } from "@nestjs/common";
import { PrismaService } from "nestjs-prisma";
import { Logger } from "winston";
import { DbService } from "src/dbService/db.service";
import { AnnotationServiceBase } from "./base/annotation.service.base";

@Injectable()
export class AnnotationService extends AnnotationServiceBase {
  constructor(
    protected readonly prisma: DbService,
    protected readonly logger: Logger
  ) {
    super(prisma, logger);
  }
}
