import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  resource?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  action?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;
}
