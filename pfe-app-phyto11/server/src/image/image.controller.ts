import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Logger } from "winston";
import { ImageService } from "./image.service";
import { ImageControllerBase } from "./base/image.controller.base";

@swagger.ApiTags("images")
@common.Controller("images")
export class ImageController extends ImageControllerBase {
  constructor(
    protected readonly service: ImageService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder,
    @common.Inject("winston")
    protected readonly logger: Logger
  ) {
    super(service, rolesBuilder, logger);
  }
}
