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
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Index(['userId', 'roleId'], { unique: true })
export class UserRole {
  @ApiProperty({
    description: 'User role assignment unique identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User ID',
    example: 123,
  })
  @Column()
  userId: number;

  @ApiProperty({
    description: 'Role ID',
    example: 2,
  })
  @Column()
  roleId: number;

  @ApiProperty({
    description: 'Role assignment timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  assignedAt: Date;

  @ApiProperty({
    description: 'Who assigned this role',
    example: 'admin@hotelier.com',
    required: false,
  })
  @Column({ nullable: true })
  assignedBy?: string;

  // Relations
  @ApiProperty({
    description: 'User associated with this role assignment',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    description: 'Role assigned to the user',
    type: () => Role,
  })
  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roleId' })
  role: Role;
}
