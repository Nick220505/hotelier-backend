import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { SystemPermission } from '../auth/entities/system-permission.entity';

import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { ResourcePermissionsResponseDto } from './dto/resource-permissions-response.dto';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditResource } from '../audit/enums/audit-resource.enum';

@ApiTags('permissions')
@Controller('permissions')
@AuditLog({ resource: AuditResource.PERMISSION })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get All Permissions',
    description: 'Retrieve a list of all system permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [SystemPermission],
  })
  findAll(): Promise<SystemPermission[]> {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Permission by ID',
    description: 'Retrieve a specific permission by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: SystemPermission,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SystemPermission | null> {
    return this.permissionsService.findOne(id);
  }

  @Get('resource/:resource')
  @ApiOperation({
    summary: 'Get Permissions by Resource',
    description: 'Retrieve all permissions for a specific resource.',
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource name',
    example: 'reservations',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [SystemPermission],
  })
  findByResource(
    @Param('resource') resource: string,
  ): Promise<SystemPermission[]> {
    return this.permissionsService.findByResource(resource);
  }

  @Get('action/:action')
  @ApiOperation({
    summary: 'Get Permissions by Action',
    description: 'Retrieve all permissions for a specific action.',
  })
  @ApiParam({
    name: 'action',
    description: 'Permission action',
    example: 'READ',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
    type: [SystemPermission],
  })
  findByAction(@Param('action') action: string): Promise<SystemPermission[]> {
    return this.permissionsService.findByAction(action);
  }

  @Get('resource-action/:resource/:action')
  @ApiOperation({
    summary: 'Get Permission by Resource and Action',
    description:
      'Retrieve a specific permission by resource and action combination.',
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource name',
    example: 'reservations',
  })
  @ApiParam({
    name: 'action',
    description: 'Permission action',
    example: 'READ',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission retrieved successfully',
    type: SystemPermission,
  })
  @ApiResponse({
    status: 404,
    description: 'Permission not found',
  })
  findByResourceAndAction(
    @Param('resource') resource: string,
    @Param('action') action: string,
  ): Promise<SystemPermission | null> {
    return this.permissionsService.findByResourceAndAction(resource, action);
  }

  @Post()
  @ApiOperation({
    summary: 'Create Permission',
    description: 'Create a new system permission.',
  })
  @ApiBody({
    description: 'Permission data',
    type: CreateSystemPermissionDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully',
    type: SystemPermission,
  })
  create(@Body() data: CreateSystemPermissionDto): Promise<SystemPermission> {
    return this.permissionsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Permission',
    description: 'Update an existing permission.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: 1,
    type: Number,
  })
  @ApiBody({
    description: 'Updated permission data',
    type: UpdateSystemPermissionDto,
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSystemPermissionDto,
  ): Promise<SystemPermission> {
    return this.permissionsService.update(id, data);
  }

  @Get('resources-with-permissions')
  @ApiOperation({
    summary: 'Get Resources with Permissions',
    description:
      'Retrieve a mapping of resources to their available permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource permissions mapping retrieved successfully',
    type: ResourcePermissionsResponseDto,
  })
  getResourcesWithPermissions(): Promise<ResourcePermissionsResponseDto> {
    return this.permissionsService.getResourcesWithPermissions();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Permission',
    description: 'Remove a permission from the system.',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
    example: 1,
    type: Number,
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
  remove(@Param('id', ParseIntPipe) id: number): Promise<SystemPermission> {
    return this.permissionsService.remove(id);
  }
}
