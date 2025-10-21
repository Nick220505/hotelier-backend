import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { User } from '../entities/user.entity';

export class RegisterDto extends OmitType(User, [
  'id',
  'password',
  'loyaltyPoints',
  'loyaltyLevel',
  'preferences',
  'registrationDate',
  'lastVisit',
  'createdAt',
  'updatedAt',
  'firstVisit',
  'isActive',
  'lastLogin',
  'refreshToken',
  'userRoles',
]) {
  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @Matches(/.*[A-Z].*/, {
    message: 'password must contain at least one uppercase letter',
  })
  @Matches(/.*[a-z].*/, {
    message: 'password must contain at least one lowercase letter',
  })
  @Matches(/.*\d.*/, {
    message: 'password must contain at least one number',
  })
  @Matches(/.*[^A-Za-z0-9].*/, {
    message: 'password must contain at least one special character',
  })
  password: string;

  @ApiProperty({
    description: 'Role ID to assign to user',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  roleId?: number;
}
