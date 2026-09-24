import { ApiProperty } from "@nestjs/swagger";
import { Annotation } from "./Annotation";
export class getListAnnotationDto {
  @ApiProperty({
    type: [Annotation],
  })
  readonly paginatedResult!: [Annotation];

  @ApiProperty({
    type: Number,
  })
  readonly totalCount!: number;
}
