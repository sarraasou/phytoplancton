import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { AnnotationService } from "./annotation.service";
import { AnnotationControllerBase } from "./base/annotation.controller.base";

@swagger.ApiTags("annotations")
@common.Controller("annotations")
export class AnnotationController extends AnnotationControllerBase {
  constructor(
    protected readonly service: AnnotationService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger
  ) {
    super(service, rolesBuilder, logger);
  }
}
