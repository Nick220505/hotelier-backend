import { OmitType } from '@nestjs/swagger';
import { SystemPermission } from '../entities/system-permission.entity';

export class CreatePermissionDto extends OmitType(SystemPermission, [
  'id',
  'createdAt',
  'updatedAt',
  'roles',
]) {}
