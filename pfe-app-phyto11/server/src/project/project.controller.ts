// server/src/project/project.controller.ts
import * as common from "@nestjs/common";
import { MockUserRoles } from "src/mockUserRole";
import { AllowAllGuard } from "src/allowGuard";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { Request } from "express";
import { plainToClass } from "class-transformer";
import { ProjectService } from "./project.service";
import { ProjectControllerBase } from "./base/project.controller.base";
import * as abacUtil from "../auth/abac.util";
import * as errors from "../errors";
import { Project } from "./base/Project";
import { ProjectCreateInput } from "./base/ProjectCreateInput";
import { ProjectFindManyArgs } from "./base/ProjectFindManyArgs";
import { ProjectWhereUniqueInput } from "./base/ProjectWhereUniqueInput";
import { PaginatedInterface } from "../util/PaginatedInterface";
import { getListProjectDto } from "./base/getListProject.dto";
import { ProjectPermissionService } from '../project-permission/project-permission.service';
import { DbService } from '../dbService/db.service';

@swagger.ApiTags("projects")
@common.Controller("projects")
export class ProjectController extends ProjectControllerBase {
  constructor(
    protected readonly service: ProjectService,
    private readonly permService: ProjectPermissionService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger,
    protected readonly prisma: DbService,
  ) {
    super(service, rolesBuilder, logger);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET /projects  (liste)
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Get()
  @nestAccessControl.UseRoles({ resource: "Project", action: "read", possession: "any" })
  @swagger.ApiOkResponse({ type: getListProjectDto })
  @swagger.ApiForbiddenResponse()
  @swagger.ApiQuery({ type: () => ProjectFindManyArgs, style: "deepObject", explode: true })
  async findMany(
    @common.Req() request: Request,
    @MockUserRoles() userRoles: string[]
  ): Promise<PaginatedInterface<Project>> {
    const args = plainToClass(ProjectFindManyArgs, request.query);
    const permission = this.rolesBuilder.permission({
      role: userRoles, action: "read", possession: "any", resource: "Project",
    });
    const results = await this.service.findMany({
      ...args,
      select: {
        id: true, createdAt: true, updatedAt: true, deletedAt: true,
        title: true, description: true, tool: true,
        user: { select: { id: true } },
        collaborators: { select: { id: true } },
      },
    });
    return {
      paginatedResult: results.paginatedResult.map((item: Project) => permission.filter(item)),
      totalCount: results.totalCount,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ✅ ROUTES STATIQUES AVANT /:id — sinon NestJS les capturera comme param
  // GET /projects/:id/karenia-stats
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Get(':id/karenia-stats')
  async getKareniaStats(
    @common.Param('id') id: string,
    @MockUserRoles() userRoles: string[]
  ) {
    const project = await this.service.findOne({
      where: { id },
      select: {
        images: {
          where: { deletedAt: null },
          select: {
            annotations: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { result: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new errors.NotFoundException(`Project ${id} not found`);
    }

    let kareniaCount = 0;
    let alexandriumCount = 0;
    let autresCount  = 0;
    let analyzedCount = 0;

    for (const image of (project as any).images ?? []) {
      if (image.annotations?.length > 0) {
        analyzedCount++;
        const r = image.annotations[0].result;
        if (r === 'Karenia') kareniaCount++;
        else if (r === 'Alexandrium') alexandriumCount++;
        else autresCount++;
      }
    }

    const total      = kareniaCount + alexandriumCount + autresCount;
    const kareniaPercentage = total > 0 ? Math.round((kareniaCount / total) * 1000) / 10 : 0;
    const alexandriumPercentage = total > 0 ? Math.round((alexandriumCount / total) * 1000) / 10 : 0;

    return {
      projectId:    id,
      totalImages:  (project as any).images?.length ?? 0,
      analyzedCount,
      kareniaCount,
      alexandriumCount,
      autresCount,
      kareniaPercentage,
      alexandriumPercentage,
      percentage: kareniaPercentage,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET /projects/:id/karenia-history
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Get(':id/karenia-history')
  async getKareniaHistory(
    @common.Param('id') id: string,
    @common.Query('days') days = '30',
    @MockUserRoles() userRoles: string[]
  ) {
    const daysNumber = parseInt(days) || 30;
    const startDate  = new Date();
    startDate.setDate(startDate.getDate() - daysNumber);

    const annotations = await this.prisma.annotation.findMany({
      where: {
        image:   { projectId: id, deletedAt: null },
        deletedAt: null,
        createdAt: { gte: startDate },
      },
      select: { result: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const daily: Record<string, { karenia: number; alexandrium: number; autres: number }> = {};

    for (const ann of annotations) {
      const key = ann.createdAt.toISOString().split('T')[0];
      if (!daily[key]) daily[key] = { karenia: 0, alexandrium: 0, autres: 0 };
      if (ann.result === 'Karenia') daily[key].karenia++;
      else if (ann.result === 'Alexandrium') daily[key].alexandrium++;
      else daily[key].autres++;
    }

    return Object.entries(daily).map(([date, s]) => {
      const t = s.karenia + s.alexandrium + s.autres;
      return {
        date,
        kareniaPercentage: t > 0 ? Math.round((s.karenia / t) * 1000) / 10 : 0,
        alexandriumPercentage: t > 0 ? Math.round((s.alexandrium / t) * 1000) / 10 : 0,
        percentage: t > 0 ? Math.round((s.karenia / t) * 1000) / 10 : 0,
      };
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GET /projects/:id  (détail — APRÈS les routes statiques)
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Get("/:id")
  @nestAccessControl.UseRoles({ resource: "Project", action: "read", possession: "own" })
  @swagger.ApiOkResponse({ type: Project })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async findOne(
    @common.Param() params: ProjectWhereUniqueInput,
    @MockUserRoles() userRoles: string[]
  ): Promise<Project | null> {
    const permission = this.rolesBuilder.permission({
      role: userRoles, action: "read", possession: "own", resource: "Project",
    });

    const result = await this.service.findOne({
      where: params,
      select: {
        id: true, createdAt: true, updatedAt: true, deletedAt: true,
        title: true, description: true, tool: true,
        user: { select: { id: true } },
        images: {
          select: {
            id: true, name: true, url: true,
            annotations: {
              select: { id: true, result: true, url: true, createdAt: true },
              orderBy: { createdAt: "asc" },
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!result) {
      this.logger.log({ level: "error", message: `No resource was found for ${JSON.stringify(params)}` });
      throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(params)}`);
    }

    return permission.filter(result);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // POST /projects
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Post()
  @nestAccessControl.UseRoles({ resource: "Project", action: "create", possession: "any" })
  @swagger.ApiCreatedResponse({ type: Project })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async create(
    @common.Body() data: ProjectCreateInput,
    @MockUserRoles() userRoles: string[]
  ): Promise<Project> {
    const permission = this.rolesBuilder.permission({
      role: userRoles, action: "create", possession: "any", resource: "Project",
    });
    const invalidAttributes = abacUtil.getInvalidAttributes(permission, data);
    if (invalidAttributes.length) {
      throw new errors.ForbiddenException(
        `providing the properties: ${invalidAttributes.map((a: string) => JSON.stringify(a)).join(", ")} on Project creation is forbidden for roles: ${userRoles.join(",")}`
      );
    }

    const { id: _i, createdAt: _c, updatedAt: _u, deletedAt: _d, userId: _uid, ...safeData } = data as any;

    if (safeData.user?.id) {
      const exists = await this.service.userExists(safeData.user.id);
      if (!exists) throw new common.BadRequestException(`Selected user does not exist: ${safeData.user.id}`);
    }

    return this.service.create({
      data: {
        ...safeData,
        images: safeData.images ? { createMany: { data: safeData.images, skipDuplicates: true } } : undefined,
        user:   safeData.user   ? { connect: safeData.user } : undefined,
      },
      select: {
        id: true, createdAt: true, updatedAt: true, deletedAt: true,
        title: true, description: true, tool: true, images: true,
        user: { select: { id: true } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PATCH /projects/:id
  // ═══════════════════════════════════════════════════════════════════════
  @common.UseGuards(AllowAllGuard)
  @common.Patch("/:id")
  @nestAccessControl.UseRoles({ resource: "Project", action: "update", possession: "any" })
  @swagger.ApiOkResponse({ type: Project })
  @swagger.ApiNotFoundResponse({ type: errors.NotFoundException })
  @swagger.ApiForbiddenResponse({ type: errors.ForbiddenException })
  async update(
    @common.Param() params: ProjectWhereUniqueInput,
    @common.Body() body: any,
    @MockUserRoles() userRoles: string[]
  ): Promise<Project | null> {
    const permission = this.rolesBuilder.permission({
      role: userRoles, action: "update", possession: "any", resource: "Project",
    });

    const safeData: any = {};
    if (body.title       !== undefined) safeData.title       = body.title;
    if (body.description !== undefined) safeData.description = body.description;
    if (body.tool        !== undefined) safeData.tool        = body.tool;
    if (body.user?.id)                  safeData.user        = { connect: { id: body.user.id } };

    const invalidAttributes = abacUtil.getInvalidAttributes(permission, safeData);
    if (invalidAttributes.length) {
      throw new errors.ForbiddenException(
        `providing the properties: ${invalidAttributes.map((a: string) => JSON.stringify(a)).join(", ")} on Project update is forbidden`
      );
    }

    return this.service.update({
      where: params,
      data:  safeData,
      select: {
        id: true, createdAt: true, updatedAt: true,
        title: true, description: true, tool: true,
        user: { select: { id: true } },
      },
    });
  }
}
