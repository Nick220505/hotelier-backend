import { ApiProperty } from '@nestjs/swagger';
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RoleInfo {
  @ApiProperty({
    description: 'Role ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
  })
  name: string;
}

class UserProfileInfo {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User email',
    example: 'user@hotelier.com',
  })
  email: string;

  @ApiProperty({
    description: 'Guest name for reservations',
    example: 'John Doe',
    required: false,
  })
  guestName?: string;

  @ApiProperty({
    description: 'Guest phone for reservations',
    example: '+1234567890',
    required: false,
  })
  guestPhone?: string;

  @ApiProperty({
    description: 'User roles',
    type: [RoleInfo],
    isArray: true,
  })
  roles: Array<RoleInfo>;
}

export class ProfileRequestDto {
  @ApiProperty({
    description: 'User profile information',
    type: UserProfileInfo,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => UserProfileInfo)
  user: UserProfileInfo;
}
