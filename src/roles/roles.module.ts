import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';
import { SystemPermission } from '../auth/entities/system-permission.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { RolePermission } from '../auth/entities/role-permission.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Role,
      SystemPermission,
      UserRole,
      RolePermission,
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
