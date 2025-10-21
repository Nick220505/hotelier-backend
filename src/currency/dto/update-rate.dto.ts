import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Length } from 'class-validator';

export class UpdateRateDto {
  @ApiProperty({
    description: 'Source currency code (3-letter ISO code)',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be exactly 3 characters' })
  fromCurrency: string;

  @ApiProperty({
    description: 'Target currency code (3-letter ISO code)',
    example: 'COP',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'Currency code must be exactly 3 characters' })
  toCurrency: string;

  @ApiProperty({
    description: 'Exchange rate from source to target currency',
    example: 4200.0,
    minimum: 0.000001,
  })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0.000001, { message: 'Exchange rate must be greater than 0' })
  rate: number;
}
