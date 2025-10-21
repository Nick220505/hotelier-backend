import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

export class ResourcePermissionDto {
  @ApiProperty({
    description: 'Name of the resource',
    example: 'reservations',
  })
  @IsString()
  resource: string;

  @ApiProperty({
    description: 'Array of available actions for this resource',
    isArray: true,
    example: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}
