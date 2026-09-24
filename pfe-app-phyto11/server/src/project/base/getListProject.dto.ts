import { ApiProperty } from "@nestjs/swagger";
import { Project } from "./Project";
export class getListProjectDto {
  @ApiProperty({
    type: [Project],
  })
  readonly paginatedResult!: [Project];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
