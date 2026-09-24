import { ApiProperty } from "@nestjs/swagger";
import { Collaborator } from "./Collaborator";
export class getListCollaboratorDto {
  @ApiProperty({
    type: [Collaborator],
  })
  readonly paginatedResult!: [Collaborator];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
