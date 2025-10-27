# Diagrama de Clases - Módulo de Moneda (Currency)

```mermaid
classDiagram
    %% Controllers
    class CurrencyController {
        -CurrencyService currencyService
        +getSupportedCurrencies() string[]
        +getAllRates() CurrencyRate[]
        +getExchangeRate(from, to) number
        +convert(convertDto) ConversionResult
        +convertQuery(amount, from, to) ConversionResult
        +formatAmount(amount, currency) string
        +getDualCurrencyDisplay(amount, currency) object
        +updateExchangeRate(updateRateDto) void
        +getCurrencySymbol(currency) string
    }

    %% Services
    class CurrencyService {
        -Map~string, CurrencyRate~ rates
        -string[] supportedCurrencies
        -ConfigService configService
        -initializeDefaultRates() void
        +convert(amount, fromCurrency, toCurrency) ConversionResult
        +getExchangeRate(fromCurrency, toCurrency) number
        +updateExchangeRate(fromCurrency, toCurrency, newRate) void
        +getSupportedCurrencies() string[]
        +isSupportedCurrency(currency) boolean
        +getAllRates() CurrencyRate[]
        +formatAmount(amount, currency) string
        +getCurrencySymbol(currency) string
        +getDualCurrencyDisplay(amount, baseCurrency) object
        -roundToTwoDecimals(num) number
        -roundToDecimals(num, decimals) number
    }

    %% DTOs
    class ConvertDto {
        +number amount
        +string fromCurrency
        +string toCurrency
    }

    class UpdateRateDto {
        +string fromCurrency
        +string toCurrency
        +number rate
    }

    %% Interfaces
    class CurrencyRate {
        <<interface>>
        +string from
        +string to
        +number rate
        +Date lastUpdated
    }

    class ConversionResult {
        <<interface>>
        +number originalAmount
        +string originalCurrency
        +number convertedAmount
        +string convertedCurrency
        +number rate
        +Date timestamp
    }

    %% Relationships
    CurrencyController --> CurrencyService : uses
    CurrencyController ..> ConvertDto : receives
    CurrencyController ..> UpdateRateDto : receives
    CurrencyController ..> CurrencyRate : returns
    CurrencyController ..> ConversionResult : returns
    
    CurrencyService --> CurrencyRate : manages
    CurrencyService ..> ConversionResult : creates
    CurrencyService ..> ConvertDto : processes
    CurrencyService ..> UpdateRateDto : processes
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de moneda:

### Controllers
- **CurrencyController**: Maneja las peticiones HTTP para conversión de moneda y tasas de cambio

### Services
- **CurrencyService**: Lógica de negocio para conversión de monedas
  - Gestión de tasas de cambio en memoria
  - Conversión entre COP y USD
  - Formateo según estándares locales
  - Display dual en ambas monedas
  - Actualización de tasas (admin)

### DTOs
- **ConvertDto**: Datos para conversión de moneda
  - Cantidad a convertir
  - Moneda origen (código ISO 3 letras)
  - Moneda destino (código ISO 3 letras)
- **UpdateRateDto**: Datos para actualizar tasa de cambio
  - Moneda origen
  - Moneda destino
  - Nueva tasa de cambio

### Interfaces
- **CurrencyRate**: Tasa de cambio entre dos monedas
  - Moneda origen y destino
  - Tasa de cambio numérica
  - Fecha de última actualización
- **ConversionResult**: Resultado de una conversión
  - Cantidad original y moneda
  - Cantidad convertida y moneda
  - Tasa utilizada
  - Timestamp de la conversión

### Funcionalidades Principales
- Conversión de moneda COP ↔ USD
- Tasas de cambio configurables
- Formateo localizado de cantidades monetarias:
  - COP: Sin decimales (formato colombiano)
  - USD: 2 decimales (formato estadounidense)
- Display dual para mostrar precios en ambas monedas simultáneamente
- Obtención de símbolos de moneda
- API de consulta de tasas de cambio
- Actualización administrativa de tasas
- Validación de monedas soportadas
- Redondeo automático de cantidades

### Notas de Implementación
- Tasas de cambio almacenadas en memoria (Map)
- Tasas por defecto: 1 USD = 4200 COP (aproximado)
- Actualización bidireccional automática de tasas inversas
- En producción, las tasas deberían obtenerse de una API externa
