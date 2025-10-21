import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourcePermissionDto } from './resource-permission.dto';

export class ResourcePermissionsResponseDto {
  @ApiProperty({
    description: 'List of all resources with their available permissions',
    type: [ResourcePermissionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourcePermissionDto)
  resources: ResourcePermissionDto[];
}
