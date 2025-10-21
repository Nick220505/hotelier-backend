import { PartialType } from '@nestjs/swagger';
import { CreateSystemPermissionDto } from './create-system-permission.dto';

export class UpdateSystemPermissionDto extends PartialType(
  CreateSystemPermissionDto,
) {}
