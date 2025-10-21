import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
// Forward references to avoid circular imports
import type { UserRole } from './user-role.entity';
import type { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @ApiProperty({
    description: 'Role unique identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Role name (unique)',
    example: 'admin',
  })
  @IsString()
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'System Administrator - Full access',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Whether this is a system-defined role',
    example: true,
  })
  @IsBoolean()
  @Column({ default: false })
  isSystem: boolean;

  @ApiProperty({
    description: 'Role creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Role last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ApiProperty({
    description: 'User role assignments',
    type: () => Array,
    isArray: true,
  })
  @OneToMany('UserRole', 'role', { cascade: true })
  userRoles: UserRole[];

  @ApiProperty({
    description: 'Role permissions',
    type: () => Array,
    isArray: true,
  })
  @OneToMany('RolePermission', 'role', {
    cascade: true,
  })
  permissions: RolePermission[];
}
