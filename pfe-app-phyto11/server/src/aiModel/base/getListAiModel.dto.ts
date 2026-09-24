import { ApiProperty } from "@nestjs/swagger";
import { AiModel } from "./AiModel";
export class getListAiModelDto {
  @ApiProperty({
    type: [AiModel],
  })
  readonly paginatedResult!: [AiModel];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
