import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { SystemPermission } from '../../entities/system-permission.entity';
import { RolePermission } from '../../entities/role-permission.entity';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(SystemPermission)
    private permissionRepository: Repository<SystemPermission>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async seed() {
    const roles = [
      {
        name: 'administrador',
        description: 'Administrador del Sistema - Acceso completo',
        isSystem: true,
        permissions: [
          'users:create',
          'users:read',
          'users:update',
          'users:delete',
          'users:manage_roles',
          'roles:create',
          'roles:read',
          'roles:update',
          'roles:delete',
          'reservations:create',
          'reservations:read',
          'reservations:update',
          'reservations:delete',
          'reservations:check_in',
          'reservations:check_out',
          'rooms:create',
          'rooms:read',
          'rooms:update',
          'rooms:delete',
          'billing:create',
          'billing:read',
          'billing:update',
          'billing:delete',
          'dashboard:read',
          'reports:read',
          'reports:create',
          'housekeeping:create',
          'housekeeping:read',
          'housekeeping:update',
          'housekeeping:delete',
          'restaurant:create',
          'restaurant:read',
          'restaurant:update',
          'restaurant:delete',
          'inventory:create',
          'inventory:read',
          'inventory:update',
          'inventory:delete',
          'employees:create',
          'employees:read',
          'employees:update',
          'employees:delete',
          'parking:create',
          'parking:read',
          'parking:update',
          'parking:delete',
          'events:create',
          'events:read',
          'events:update',
          'events:delete',
          'recreational:create',
          'recreational:read',
          'recreational:update',
          'recreational:delete',
          'maintenance:create',
          'maintenance:read',
          'maintenance:update',
          'maintenance:delete',
          'configuration:create',
          'configuration:read',
          'configuration:update',
          'configuration:delete',
        ],
      },
      {
        name: 'gerente',
        description: 'Gerente del Hotel - Acceso operacional',
        isSystem: true,
        permissions: [
          'users:read',
          'users:update',
          'reservations:create',
          'reservations:read',
          'reservations:update',
          'reservations:check_in',
          'reservations:check_out',
          'rooms:create',
          'rooms:read',
          'rooms:update',
          'billing:create',
          'billing:read',
          'billing:update',
          'dashboard:read',
          'reports:read',
          'reports:create',
          'housekeeping:read',
          'housekeeping:update',
          'restaurant:read',
          'restaurant:update',
          'inventory:read',
          'inventory:update',
          'employees:read',
          'employees:update',
          'parking:read',
          'parking:update',
          'events:create',
          'events:read',
          'events:update',
          'recreational:create',
          'recreational:read',
          'recreational:update',
          'maintenance:read',
          'maintenance:update',
          'configuration:read',
        ],
      },
      {
        name: 'recepcionista',
        description: 'Recepcionista - Personal de recepción',
        isSystem: true,
        permissions: [
          'reservations:create',
          'reservations:read',
          'reservations:update',
          'reservations:check_in',
          'reservations:check_out',
          'rooms:read',
          'rooms:update',
          'billing:create',
          'billing:read',
          'billing:update',
          'dashboard:read',
          'parking:create',
          'parking:read',
          'parking:update',
          'events:read',
          'recreational:create',
          'recreational:read',
          'recreational:update',
        ],
      },
      {
        name: 'cliente',
        description: 'Cliente del Hotel - Acceso para crear reservas y pedidos',
        isSystem: true,
        permissions: [
          'reservations:create',
          'reservations:read',
          'reservations:update',
          'rooms:read',
          'restaurant:create',
          'restaurant:read',
          'events:create',
          'events:read',
          'recreational:create',
          'recreational:read',
          'parking:create',
          'parking:read',
          'parking:update',
          'users:read',
          'users:update',
        ],
      },
      {
        name: 'personal_limpieza',
        description: 'Personal de Limpieza - Gestión de housekeeping',
        isSystem: true,
        permissions: [
          'housekeeping:create',
          'housekeeping:read',
          'housekeeping:update',
          'rooms:read',
          'rooms:update',
          'inventory:read',
          'inventory:update',
          'dashboard:read',
        ],
      },
      {
        name: 'mantenimiento',
        description: 'Personal de Mantenimiento - Gestión de mantenimiento',
        isSystem: true,
        permissions: [
          'maintenance:create',
          'maintenance:read',
          'maintenance:update',
          'rooms:read',
          'rooms:update',
          'inventory:read',
          'inventory:update',
          'dashboard:read',
        ],
      },
      {
        name: 'personal_restaurante',
        description: 'Personal de Restaurante - Gestión de restaurante',
        isSystem: true,
        permissions: [
          'restaurant:create',
          'restaurant:read',
          'restaurant:update',
          'restaurant:delete',
          'inventory:read',
          'inventory:update',
          'billing:create',
          'billing:read',
          'dashboard:read',
          'events:read',
          'events:update',
          'recreational:read',
        ],
      },
    ];

    for (const roleData of roles) {
      let role = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!role) {
        role = await this.roleRepository.save({
          name: roleData.name,
          description: roleData.description,
          isSystem: roleData.isSystem,
        });
      }

      // Assign permissions to role
      await this.assignPermissionsToRole(role, roleData.permissions);
    }
  }

  private async assignPermissionsToRole(
    role: Role,
    permissionStrings: string[],
  ) {
    for (const permissionString of permissionStrings) {
      const [resource, action] = permissionString.split(':');
      const permission = await this.permissionRepository.findOne({
        where: { resource, action },
      });

      if (permission) {
        const exists = await this.rolePermissionRepository.findOne({
          where: { roleId: role.id, permissionId: permission.id },
        });

        if (!exists) {
          await this.rolePermissionRepository.save({
            roleId: role.id,
            permissionId: permission.id,
          });
        }
      }
    }
  }
}
