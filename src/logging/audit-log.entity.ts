import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Audit log ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Action performed (HTTP method or business action)',
  })
  @IsString()
  @Column()
  action: string;

  @ApiProperty({ description: 'Module or resource name' })
  @IsString()
  @Column()
  module: string;

  @ApiProperty({
    description: 'User ID related to the action',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Column({ type: 'int', nullable: true })
  userId?: number | null;

  @ApiProperty({ description: 'HTTP method', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  method?: string | null;

  @ApiProperty({ description: 'Request URL', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  url?: string | null;

  @ApiProperty({ description: 'Client IP address', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  ip?: string | null;

  @ApiProperty({ description: 'User agent', required: false })
  @IsOptional()
  @IsString()
  @Column({ type: 'varchar', nullable: true })
  userAgent?: string | null;

  @ApiProperty({
    description: 'Payload snapshot (stringified)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Column({ type: 'text', nullable: true })
  payload?: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
