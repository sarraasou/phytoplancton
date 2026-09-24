import * as common from "@nestjs/common";import { MockUserRoles } from "src/mockUserRole";import { AllowAllGuard } from "src/allowGuard";

import { ApiProperty } from "@nestjs/swagger";

export class ForbiddenException extends common.ForbiddenException {
  @ApiProperty()
  statusCode!: number;
  @ApiProperty()
  message!: string;
}

export class NotFoundException extends common.NotFoundException {
  @ApiProperty()
  statusCode!: number;
  @ApiProperty()
  message!: string;
}
