import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Role } from '../auth/entities/role.entity';
import { SystemPermission } from '../auth/entities/system-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditResource } from '../audit/enums/audit-resource.enum';

@ApiTags('roles')
@Controller('roles')
@AuditLog({ resource: AuditResource.ROLE })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Role Management Endpoints
  @Post()
  @ApiOperation({
    summary: 'Create Role',
    description: 'Create a new role in the system.',
  })
  @ApiBody({
    description: 'Role creation data',
    type: CreateRoleDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: Role,
  })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get All Roles',
    description: 'Retrieve all roles in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: [Role],
  })
  async getAllRoles(): Promise<Role[]> {
    return this.rolesService.findAllRoles();
  }

  // System Permissions Management - Must come before :id route
  @Get('permissions')
  @ApiOperation({
    summary: 'Get All Permissions',
    description: 'Retrieve all system permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [SystemPermission],
  })
  async getAllPermissions(): Promise<SystemPermission[]> {
    return this.rolesService.findAllPermissions();
  }

  @Get('permissions/by-resource')
  @ApiOperation({
    summary: 'Get Permissions by Resource',
    description: 'Retrieve permissions grouped by resource type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions by resource retrieved successfully',
    schema: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { $ref: '#/components/schemas/SystemPermission' },
      },
    },
  })
  async getPermissionsByResource(): Promise<
    Record<string, SystemPermission[]>
  > {
    return this.rolesService.getPermissionsByResource();
  }

  @Get('name/:name')
  @ApiOperation({
    summary: 'Get Role by Name',
    description: 'Retrieve a specific role by its name.',
  })
  @ApiParam({
    name: 'name',
    description: 'Role name',
    type: 'string',
    example: 'admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async getRoleByName(@Param('name') name: string): Promise<Role> {
    const role = await this.rolesService.findRoleByName(name);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Role by ID',
    description: 'Retrieve a specific role by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async getRoleById(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    const role = await this.rolesService.findRoleById(id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Role',
    description: 'Update an existing role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    description: 'Role update data',
    type: UpdateRoleDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.updateRole(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Role',
    description: 'Delete a role from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async deleteRole(@Param('id', ParseIntPipe) id: number): Promise<Role> {
    return this.rolesService.deleteRole(id);
  }

  // Permission Assignment to Roles
  @Put(':id/permissions')
  @ApiOperation({
    summary: 'Assign Permissions to Role',
    description: 'Assign multiple permissions to a specific role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    description: 'Permission IDs to assign',
    schema: {
      type: 'object',
      properties: {
        permissionIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  async assignPermissionsToRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { permissionIds: number[] },
  ): Promise<void> {
    return this.rolesService.assignPermissionsToRole(
      roleId,
      body.permissionIds,
    );
  }

  @Delete(':roleId/permissions/:permissionId')
  @ApiOperation({
    summary: 'Remove Permission from Role',
    description: 'Remove a specific permission from a role.',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Permission removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Role or permission not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<void> {
    return this.rolesService.removePermissionsFromRole(roleId, [permissionId]);
  }

  @Post('/permissions')
  @ApiOperation({
    summary: 'Create Permission',
    description: 'Create a new system permission.',
  })
  @ApiBody({
    description: 'Permission creation data',
    type: CreatePermissionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: SystemPermission,
  })
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<SystemPermission> {
    return this.rolesService.createPermission(createPermissionDto);
  }

  @Put('/permissions/:id')
  @ApiOperation({
    summary: 'Update Permission',
    description: 'Update an existing system permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    description: 'Permission update data',
    type: UpdatePermissionDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    type: SystemPermission,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<SystemPermission> {
    return this.rolesService.updatePermission(id, updatePermissionDto);
  }

  @Delete('/permissions/:id')
  @ApiOperation({
    summary: 'Delete Permission',
    description: 'Delete a system permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully',
    type: SystemPermission,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  async deletePermission(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SystemPermission> {
    return this.rolesService.deletePermission(id);
  }

  // User Role Assignment
  @Put('/users/:userId/roles')
  @ApiOperation({
    summary: 'Assign Roles to User',
    description: 'Assign multiple roles to a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    description: 'Role IDs to assign',
    schema: {
      type: 'object',
      properties: {
        roleIds: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2],
        },
      },
    },
  })
  @ApiResponse({
    status: 204,
    description: 'Roles assigned successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request - roleIds must be an array of valid integers',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or one or more roles do not exist',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async assignRolesToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { roleIds: number[] },
  ): Promise<void> {
    // Validate that roleIds is an array
    if (!Array.isArray(body.roleIds)) {
      throw new BadRequestException('roleIds must be an array');
    }

    // Validate that all roleIds are valid numbers
    const invalidIds = body.roleIds.filter(
      (id) => id == null || !Number.isInteger(id) || id <= 0,
    );

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid role IDs: ${invalidIds.join(', ')}. Role IDs must be positive integers.`,
      );
    }

    try {
      return await this.rolesService.assignRolesToUser(userId, body.roleIds);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('do not exist')) {
          throw new NotFoundException(error.message);
        }
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Delete('/users/:userId/roles/:roleId')
  @ApiOperation({
    summary: 'Remove Role from User',
    description: 'Remove a specific role from a user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRoleFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<void> {
    return this.rolesService.removeRolesFromUser(userId, [roleId]);
  }

  @Get('/users/:userId/roles')
  @ApiOperation({
    summary: 'Get User Roles',
    description: 'Retrieve all roles assigned to a specific user.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
    type: [Role],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.rolesService.getUserRoles(userId);
  }

  @Get('/users/:userId/permissions')
  @ApiOperation({
    summary: 'Get User Permissions',
    description:
      'Retrieve all permissions for a specific user (through their roles).',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User permissions retrieved successfully',
    type: [SystemPermission],
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserPermissions(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<SystemPermission[]> {
    return this.rolesService.getUserPermissions(userId);
  }
}
