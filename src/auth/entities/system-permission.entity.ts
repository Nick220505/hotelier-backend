import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
// Forward reference to avoid circular imports
import type { RolePermission } from './role-permission.entity';

@Entity('system_permissions')
@Index(['resource', 'action'], { unique: true })
export class SystemPermission {
  @ApiProperty({
    description: 'Permission unique identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Resource that this permission applies to',
    example: 'users',
  })
  @IsString()
  @Column()
  resource: string;

  @ApiProperty({
    description: 'Action that can be performed on the resource',
    example: 'create',
  })
  @IsString()
  @Column()
  action: string;

  @ApiProperty({
    description: 'Human-readable description of the permission',
    example: 'Create users',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Whether the permission is currently active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @Column({ default: true })
  active: boolean;

  @ApiProperty({
    description: 'Permission creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Permission last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'Role permission assignments',
    type: () => Array,
    isArray: true,
  })
  @OneToMany('RolePermission', 'permission', { cascade: true })
  roles: RolePermission[];
}
