import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { ProjectService } from "./project.service";
import { ProjectControllerBase } from "./base/project.controller.base";

@swagger.ApiTags("projects")
@common.Controller("projects")
export class ProjectController extends ProjectControllerBase {
  constructor(
    protected readonly service: ProjectService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger
  ) {
    super(service, rolesBuilder, logger);
  }
}
