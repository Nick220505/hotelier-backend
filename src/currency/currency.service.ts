import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  rate: number;
  timestamp: Date;
}

@Injectable()
export class CurrencyService {
  private rates: Map<string, CurrencyRate> = new Map();
  private readonly supportedCurrencies = ['COP', 'USD'];

  constructor(private readonly configService: ConfigService) {
    this.initializeDefaultRates();
  }

  private initializeDefaultRates(): void {
    // Default exchange rates - in production these would come from an external API
    const defaultRates: CurrencyRate[] = [
      {
        from: 'USD',
        to: 'COP',
        rate: 4200, // 1 USD = 4200 COP (approximate)
        lastUpdated: new Date(),
      },
      {
        from: 'COP',
        to: 'USD',
        rate: 0.000238, // 1 COP = 0.000238 USD (approximate)
        lastUpdated: new Date(),
      },
    ];

    defaultRates.forEach((rate) => {
      this.rates.set(`${rate.from}_${rate.to}`, rate);
    });
  }

  /**
   * Convert amount from one currency to another
   */
  convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): ConversionResult {
    if (!this.isSupportedCurrency(fromCurrency)) {
      throw new Error(`Currency ${fromCurrency} is not supported`);
    }

    if (!this.isSupportedCurrency(toCurrency)) {
      throw new Error(`Currency ${toCurrency} is not supported`);
    }

    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        convertedCurrency: toCurrency,
        rate: 1,
        timestamp: new Date(),
      };
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = this.rates.get(rateKey);

    if (!rate) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`,
      );
    }

    const convertedAmount = this.roundToTwoDecimals(amount * rate.rate);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      convertedCurrency: toCurrency,
      rate: rate.rate,
      timestamp: new Date(),
    };
  }

  /**
   * Get current exchange rate between two currencies
   */
  getExchangeRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    const rate = this.rates.get(rateKey);

    if (!rate) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`,
      );
    }

    return rate.rate;
  }

  /**
   * Update exchange rate (for admin use)
   */
  updateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    newRate: number,
  ): void {
    if (
      !this.isSupportedCurrency(fromCurrency) ||
      !this.isSupportedCurrency(toCurrency)
    ) {
      throw new Error('One or both currencies are not supported');
    }

    const rateKey = `${fromCurrency}_${toCurrency}`;
    this.rates.set(rateKey, {
      from: fromCurrency,
      to: toCurrency,
      rate: newRate,
      lastUpdated: new Date(),
    });

    // Also update the reverse rate
    const reverseRateKey = `${toCurrency}_${fromCurrency}`;
    this.rates.set(reverseRateKey, {
      from: toCurrency,
      to: fromCurrency,
      rate: this.roundToDecimals(1 / newRate, 6),
      lastUpdated: new Date(),
    });
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [...this.supportedCurrencies];
  }

  /**
   * Check if currency is supported
   */
  isSupportedCurrency(currency: string): boolean {
    return this.supportedCurrencies.includes(currency.toUpperCase());
  }

  /**
   * Get all current exchange rates
   */
  getAllRates(): CurrencyRate[] {
    return Array.from(this.rates.values());
  }

  /**
   * Format amount according to currency
   */
  formatAmount(amount: number, currency: string): string {
    const locale = currency === 'COP' ? 'es-CO' : 'en-US';
    const currencyCode = currency.toUpperCase();

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency === 'COP' ? 0 : 2,
      maximumFractionDigits: currency === 'COP' ? 0 : 2,
    }).format(amount);
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      COP: '$',
      USD: '$',
    };

    return symbols[currency.toUpperCase()] || currency;
  }

  /**
   * Convert price for display in both currencies
   */
  getDualCurrencyDisplay(
    amount: number,
    baseCurrency: string,
  ): {
    cop: { amount: number; formatted: string };
    usd: { amount: number; formatted: string };
  } {
    let copAmount: number;
    let usdAmount: number;

    if (baseCurrency === 'COP') {
      copAmount = amount;
      const conversion = this.convert(amount, 'COP', 'USD');
      usdAmount = conversion.convertedAmount;
    } else {
      usdAmount = amount;
      const conversion = this.convert(amount, 'USD', 'COP');
      copAmount = conversion.convertedAmount;
    }

    return {
      cop: {
        amount: copAmount,
        formatted: this.formatAmount(copAmount, 'COP'),
      },
      usd: {
        amount: usdAmount,
        formatted: this.formatAmount(usdAmount, 'USD'),
      },
    };
  }

  private roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  private roundToDecimals(num: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }
}
