import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/entities/role.entity';
import { SystemPermission } from '../auth/entities/system-permission.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { RolePermission } from '../auth/entities/role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(SystemPermission)
    private readonly permissionRepository: Repository<SystemPermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async createRole(data: {
    name: string;
    description?: string;
  }): Promise<Role> {
    try {
      return await this.roleRepository.save(data);
    } catch (e: unknown) {
      const err = e as { code?: unknown };
      if (typeof err.code === 'string' && err.code === '23505') {
        // Unique constraint violation
        throw new Error(`Role with name '${data.name}' already exists`);
      }
      throw e;
    }
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: { permissions: { permission: true } },
      order: { name: 'ASC' },
    });
  }

  async findRoleById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { id },
      relations: { permissions: { permission: true } },
    });
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: { permissions: { permission: true } },
    });
  }

  async updateRole(
    id: number,
    data: { name?: string; description?: string },
  ): Promise<Role> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    try {
      await this.roleRepository.update(id, data);
      const updated = await this.findRoleById(id);
      if (!updated) {
        throw new Error(`Role with id ${id} not found`);
      }
      return updated;
    } catch (e: unknown) {
      const err = e as { code?: unknown };
      if (typeof err.code === 'string' && err.code === '23505') {
        throw new Error(`Role with name '${data.name}' already exists`);
      }
      throw e;
    }
  }

  async deleteRole(id: number): Promise<Role> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystem) {
      throw new Error('Cannot delete system role');
    }

    // Check if role is being used
    const userCount = await this.userRoleRepository.count({
      where: { roleId: id },
    });

    if (userCount > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await this.roleRepository.remove(role);
    return role;
  }

  async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    const role = await this.findRoleById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Remove existing permissions
    await this.rolePermissionRepository.delete({ roleId });

    // Add new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }));
      await this.rolePermissionRepository.save(rolePermissions);
    }
  }

  async removePermissionsFromRole(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
    await this.rolePermissionRepository.delete({
      roleId,
      permissionId: permissionIds.length > 0 ? permissionIds[0] : undefined, // TypeORM limitation workaround
    });
  }

  async findAllPermissions(): Promise<SystemPermission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async getPermissionsByResource(): Promise<
    Record<string, SystemPermission[]>
  > {
    const permissions = await this.findAllPermissions();
    const grouped: Record<string, SystemPermission[]> = {};

    for (const permission of permissions) {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    }

    return grouped;
  }

  async createPermission(data: {
    resource: string;
    action: string;
    description?: string;
  }): Promise<SystemPermission> {
    try {
      return await this.permissionRepository.save(data);
    } catch (e: unknown) {
      const err = e as { code?: unknown };
      if (typeof err.code === 'string' && err.code === '23505') {
        throw new Error(
          `Permission for resource '${data.resource}' and action '${data.action}' already exists`,
        );
      }
      throw e;
    }
  }

  async updatePermission(
    id: number,
    data: { resource?: string; action?: string; description?: string },
  ): Promise<SystemPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new Error('Permission not found');
    }

    try {
      await this.permissionRepository.update(id, data);
      const updated = await this.permissionRepository.findOne({
        where: { id },
      });
      if (!updated) {
        throw new Error(`Permission with id ${id} not found`);
      }
      return updated;
    } catch (e: unknown) {
      const err = e as { code?: unknown };
      if (typeof err.code === 'string' && err.code === '23505') {
        throw new Error(
          `Permission for resource '${data.resource}' and action '${data.action}' already exists`,
        );
      }
      throw e;
    }
  }

  async deletePermission(id: number): Promise<SystemPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new Error('Permission not found');
    }

    // Check if permission is being used
    const roleCount = await this.rolePermissionRepository.count({
      where: { permissionId: id },
    });

    if (roleCount > 0) {
      throw new Error('Cannot delete permission that is assigned to roles');
    }

    await this.permissionRepository.remove(permission);
    return permission;
  }

  async assignRolesToUser(userId: number, roleIds: number[]): Promise<void> {
    // Remove existing roles
    await this.userRoleRepository.delete({ userId });

    // Add new roles
    if (roleIds.length > 0) {
      // Filter out any invalid roleIds (null, undefined, or NaN)
      const validRoleIds = roleIds.filter(
        (roleId) =>
          roleId != null && !isNaN(roleId) && Number.isInteger(roleId),
      );

      if (validRoleIds.length === 0) {
        throw new Error('No valid role IDs provided');
      }

      // Verify all roles exist using IN query
      const existingRoles = await this.roleRepository
        .createQueryBuilder('role')
        .where('role.id IN (:...roleIds)', { roleIds: validRoleIds })
        .getMany();

      if (existingRoles.length !== validRoleIds.length) {
        const foundRoleIds = existingRoles.map((r) => r.id);
        const missingRoleIds = validRoleIds.filter(
          (id) => !foundRoleIds.includes(id),
        );
        throw new Error(
          `Roles with IDs ${missingRoleIds.join(', ')} do not exist`,
        );
      }

      const userRoles = validRoleIds.map((roleId) => ({ userId, roleId }));
      await this.userRoleRepository.save(userRoles);
    }
  }

  async removeRolesFromUser(userId: number, roleIds: number[]): Promise<void> {
    if (roleIds.length > 0) {
      await this.userRoleRepository.delete({
        userId,
        roleId: roleIds.length > 0 ? roleIds[0] : undefined, // TypeORM limitation workaround
      });
    }
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await this.userRoleRepository.find({
      where: { userId },
      relations: { role: { permissions: { permission: true } } },
    });

    return userRoles.map((ur) => ur.role);
  }

  async getUserPermissions(userId: number): Promise<SystemPermission[]> {
    const roles = await this.getUserRoles(userId);
    const permissions: SystemPermission[] = [];

    for (const role of roles) {
      for (const rolePermission of role.permissions) {
        if (!permissions.find((p) => p.id === rolePermission.permission.id)) {
          permissions.push(rolePermission.permission);
        }
      }
    }

    return permissions;
  }
}
