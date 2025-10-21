import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemPermission } from '../auth/entities/system-permission.entity';
import { CreateSystemPermissionDto } from './dto/create-system-permission.dto';
import { UpdateSystemPermissionDto } from './dto/update-system-permission.dto';
import { ResourcePermissionsResponseDto } from './dto/resource-permissions-response.dto';
import { ResourcePermissionDto } from './dto/resource-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(SystemPermission)
    private readonly permissionRepository: Repository<SystemPermission>,
  ) {}

  async create(data: CreateSystemPermissionDto): Promise<SystemPermission> {
    return this.permissionRepository.save(data);
  }

  async findAll(): Promise<SystemPermission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SystemPermission | null> {
    return this.permissionRepository.findOne({
      where: { id },
    });
  }

  async findByResource(resource: string): Promise<SystemPermission[]> {
    return this.permissionRepository.find({
      where: { resource },
      order: { action: 'ASC' },
    });
  }

  async findByAction(action: string): Promise<SystemPermission[]> {
    return this.permissionRepository.find({
      where: { action },
      order: { resource: 'ASC' },
    });
  }

  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<SystemPermission | null> {
    return this.permissionRepository.findOne({
      where: { resource, action },
    });
  }

  async update(
    id: number,
    data: UpdateSystemPermissionDto,
  ): Promise<SystemPermission> {
    await this.permissionRepository.update(id, data);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<SystemPermission> {
    const permission = await this.findOne(id);
    if (!permission) {
      throw new NotFoundException(`Permission with id ${id} not found`);
    }
    await this.permissionRepository.remove(permission);
    return permission;
  }

  async getResourcesWithPermissions(): Promise<ResourcePermissionsResponseDto> {
    const permissions = await this.findAll();
    const resourceMap: Record<string, string[]> = {};

    permissions.forEach((permission) => {
      if (!resourceMap[permission.resource]) {
        resourceMap[permission.resource] = [];
      }
      resourceMap[permission.resource].push(permission.action);
    });

    const resources: ResourcePermissionDto[] = Object.entries(resourceMap).map(
      ([resource, actions]) => ({
        resource,
        actions,
      }),
    );

    return { resources };
  }
}
