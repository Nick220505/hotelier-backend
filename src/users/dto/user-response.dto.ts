import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../../auth/entities/user.entity';
import { UserRoleDto } from './user-role.dto';

export class UserResponseDto extends OmitType(User, [
  'password',
  'refreshToken',
  'userRoles',
]) {
  @ApiProperty({
    description: 'User roles',
    type: [UserRoleDto],
    example: [{ id: 1, name: 'admin', description: 'Administrator role' }],
  })
  roles: UserRoleDto[];

  @ApiProperty({
    description: 'User permissions',
    type: 'array',
    items: { type: 'string' },
    example: ['users:create', 'users:read', 'users:update', 'users:delete'],
    required: false,
  })
  permissions?: string[];
}
