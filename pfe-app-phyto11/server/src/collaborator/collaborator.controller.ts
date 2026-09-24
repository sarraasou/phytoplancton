import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { CollaboratorService } from "./collaborator.service";
import { CollaboratorControllerBase } from "./base/collaborator.controller.base";

@swagger.ApiTags("collaborators")
@common.Controller("collaborators")
export class CollaboratorController extends CollaboratorControllerBase {
  constructor(
    protected readonly service: CollaboratorService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger
  ) {
    super(service, rolesBuilder, logger);
  }
}
