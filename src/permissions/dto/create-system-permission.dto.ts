import { OmitType } from '@nestjs/swagger';
import { SystemPermission } from '../../auth/entities/system-permission.entity';

export class CreateSystemPermissionDto extends OmitType(SystemPermission, [
  'id',
  'createdAt',
  'updatedAt',
]) {}
