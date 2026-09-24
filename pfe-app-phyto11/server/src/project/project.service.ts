// server/src/project/project.service.ts

import { Injectable } from "@nestjs/common";
import { Logger } from "winston";
import { DbService } from "src/dbService/db.service";
import { ProjectServiceBase } from "./base/project.service.base";

@Injectable()
export class ProjectService extends ProjectServiceBase {
  constructor(
    protected readonly prisma: DbService,
    protected readonly logger: Logger
  ) {
    super(prisma, logger);
  }

  async userExists(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * ✅ NOUVELLE MÉTHODE pour mettre à jour un projet
   * Sans les relations problématiques
   */
  async updateProjectSimple(id: string, data: {
    title?: string;
    description?: string;
    tool?: string;
  }) {
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tool !== undefined) updateData.tool = data.tool;
    
    return this.prisma.project.update({
      where: { id },
      data: updateData,
    });
  }
}