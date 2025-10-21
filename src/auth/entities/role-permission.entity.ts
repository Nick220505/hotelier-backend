import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';
import { SystemPermission } from './system-permission.entity';

@Entity('role_permissions')
@Index(['roleId', 'permissionId'], { unique: true })
export class RolePermission {
  @ApiProperty({
    description: 'Role permission assignment unique identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Role ID',
    example: 2,
  })
  @Column()
  roleId: number;

  @ApiProperty({
    description: 'Permission ID',
    example: 5,
  })
  @Column()
  permissionId: number;

  @ApiProperty({
    description: 'Permission assignment timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ApiProperty({
    description: 'Role that has this permission',
    type: () => Role,
  })
  @ManyToOne(() => Role, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ApiProperty({
    description: 'Permission assigned to the role',
    type: () => SystemPermission,
  })
  @ManyToOne(() => SystemPermission, (permission) => permission.roles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'permissionId' })
  permission: SystemPermission;
}
