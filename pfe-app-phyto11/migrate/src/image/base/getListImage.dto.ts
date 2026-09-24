import { ApiProperty } from "@nestjs/swagger";
import { Image } from "./Image";
export class getListImageDto {
  @ApiProperty({
    type: [Image],
  })
  readonly paginatedResult!: [Image];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
