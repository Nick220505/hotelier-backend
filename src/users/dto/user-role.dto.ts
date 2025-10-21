import { ApiProperty } from '@nestjs/swagger';

export class UserRoleDto {
  @ApiProperty({ description: 'Role ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator role',
    required: false,
  })
  description?: string;
}
