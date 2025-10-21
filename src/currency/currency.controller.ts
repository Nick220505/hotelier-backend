import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  ParseFloatPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CurrencyService,
  ConversionResult,
  CurrencyRate,
} from './currency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateRateDto } from './dto/update-rate.dto';
import { ConvertDto } from './dto/convert.dto';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditResource } from '../audit/enums/audit-resource.enum';

@ApiTags('Currency')
@Controller('currency')
@AuditLog({ resource: AuditResource.BILLING })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('supported')
  @ApiOperation({ summary: 'Get supported currencies' })
  @ApiResponse({
    status: 200,
    description: 'List of supported currencies',
    type: [String],
  })
  getSupportedCurrencies(): string[] {
    return this.currencyService.getSupportedCurrencies();
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all exchange rates' })
  @ApiResponse({
    status: 200,
    description: 'Current exchange rates',
    type: [Object],
  })
  getAllRates(): CurrencyRate[] {
    return this.currencyService.getAllRates();
  }

  @Get('rate')
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  @ApiQuery({ name: 'from', description: 'Source currency code' })
  @ApiQuery({ name: 'to', description: 'Target currency code' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate',
    type: Number,
  })
  getExchangeRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ): number {
    return this.currencyService.getExchangeRate(fromCurrency, toCurrency);
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  @ApiResponse({
    status: 200,
    description: 'Currency conversion result',
    type: Object,
  })
  convert(@Body() convertDto: ConvertDto): ConversionResult {
    return this.currencyService.convert(
      convertDto.amount,
      convertDto.fromCurrency,
      convertDto.toCurrency,
    );
  }

  @Get('convert')
  @ApiOperation({
    summary: 'Convert amount between currencies via query params',
  })
  @ApiQuery({ name: 'amount', description: 'Amount to convert' })
  @ApiQuery({ name: 'from', description: 'Source currency code' })
  @ApiQuery({ name: 'to', description: 'Target currency code' })
  @ApiResponse({
    status: 200,
    description: 'Currency conversion result',
    type: Object,
  })
  convertQuery(
    @Query('amount', ParseFloatPipe) amount: number,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ): ConversionResult {
    return this.currencyService.convert(amount, fromCurrency, toCurrency);
  }

  @Get('format')
  @ApiOperation({ summary: 'Format amount according to currency' })
  @ApiQuery({ name: 'amount', description: 'Amount to format' })
  @ApiQuery({ name: 'currency', description: 'Currency code' })
  @ApiResponse({
    status: 200,
    description: 'Formatted amount string',
    type: String,
  })
  formatAmount(
    @Query('amount', ParseFloatPipe) amount: number,
    @Query('currency') currency: string,
  ): string {
    return this.currencyService.formatAmount(amount, currency);
  }

  @Get('dual-display')
  @ApiOperation({ summary: 'Get amount display in both COP and USD' })
  @ApiQuery({ name: 'amount', description: 'Amount to display' })
  @ApiQuery({ name: 'currency', description: 'Base currency code' })
  @ApiResponse({
    status: 200,
    description: 'Dual currency display',
    type: Object,
  })
  getDualCurrencyDisplay(
    @Query('amount', ParseFloatPipe) amount: number,
    @Query('currency') currency: string,
  ): {
    cop: { amount: number; formatted: string };
    usd: { amount: number; formatted: string };
  } {
    return this.currencyService.getDualCurrencyDisplay(amount, currency);
  }

  @Post('rates')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update exchange rate (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate updated successfully',
  })
  updateExchangeRate(@Body() updateRateDto: UpdateRateDto): void {
    this.currencyService.updateExchangeRate(
      updateRateDto.fromCurrency,
      updateRateDto.toCurrency,
      updateRateDto.rate,
    );
  }

  @Get('symbol')
  @ApiOperation({ summary: 'Get currency symbol' })
  @ApiQuery({ name: 'currency', description: 'Currency code' })
  @ApiResponse({
    status: 200,
    description: 'Currency symbol',
    type: String,
  })
  getCurrencySymbol(@Query('currency') currency: string): string {
    return this.currencyService.getCurrencySymbol(currency);
  }
}
