import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { AiModelService } from "./aiModel.service";
import { AiModelControllerBase } from "./base/aiModel.controller.base";

@swagger.ApiTags("ai-models")
@common.Controller("ai-models")
export class AiModelController extends AiModelControllerBase {
  constructor(
    protected readonly service: AiModelService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger
  ) {
    super(service, rolesBuilder, logger);
  }
}
