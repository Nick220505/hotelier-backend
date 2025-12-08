import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { LoyaltyLevel } from '../enums/loyalty-level.enum';
import type { UserRole } from './user-role.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'User unique identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'User email address (unique)',
    example: 'john.doe@hotelier.com',
  })
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'User password (hashed)',
    example: '$2b$10$...',
    writeOnly: true,
  })
  @IsString()
  @Exclude()
  @Column({ select: false })
  password: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsString()
  @Column()
  name: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({
    description: 'User loyalty points accumulated',
    example: 1250,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @Column({ default: 0 })
  loyaltyPoints: number;

  @ApiProperty({
    description: 'User loyalty level',
    enum: LoyaltyLevel,
    example: LoyaltyLevel.SILVER,
  })
  @IsEnum(LoyaltyLevel)
  @Column({
    type: 'enum',
    enum: LoyaltyLevel,
    default: LoyaltyLevel.BRONZE,
  })
  loyaltyLevel: LoyaltyLevel;

  @ApiProperty({
    description: 'User preferences in JSON format',
    example: '{"theme": "dark", "language": "en"}',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  preferences?: string;

  @ApiProperty({
    description: 'User registration date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  registrationDate: Date;

  @ApiProperty({
    description: 'Last visit timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastVisit?: Date;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'First visit timestamp',
    example: '2024-01-02T09:15:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  firstVisit?: Date;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @IsBoolean()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Refresh token (hashed)',
    example: '$2b$10$...',
    writeOnly: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Exclude()
  @Column({ nullable: true, select: false })
  refreshToken?: string;

  // Relations
  @ApiProperty({
    description: 'User role assignments',
    type: () => Array,
    isArray: true,
  })
  @OneToMany('UserRole', 'user', { cascade: true })
  userRoles: UserRole[];
}
