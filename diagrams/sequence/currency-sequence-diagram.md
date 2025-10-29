# Diagrama de Secuencia - Módulo de Moneda

## 1. Convertir Monto entre Monedas

```mermaid
---
title: Convertir Monto entre Monedas
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: POST /currency/convert (convertDto)
    Controller->>+Service: convert(amount, fromCurrency, toCurrency)
    
    Service->>Service: isSupportedCurrency(fromCurrency)
    alt Moneda no soportada
        Service-->>Controller: Error: Currency not supported
        Controller-->>Usuario: 400 - Currency not supported
    end
    
    Service->>Service: isSupportedCurrency(toCurrency)
    alt Moneda no soportada
        Service-->>Controller: Error: Currency not supported
        Controller-->>Usuario: 400 - Currency not supported
    end
    
    alt Misma moneda
        Service->>Service: buildConversionResult(amount, amount, rate: 1)
    else Conversión requerida
        Service->>Service: buildRateKey(fromCurrency, toCurrency)
        Note over Service: rateKey = 'USD_COP'
        
        Service->>Service: rates.get(rateKey)
        alt Tasa no encontrada
            Service-->>Controller: Error: Exchange rate not found
            Controller-->>Usuario: 400 - Exchange rate not found
        else Tasa encontrada
            Service->>Service: calculateConvertedAmount(amount * rate.rate)
            Service->>Service: roundToTwoDecimals(convertedAmount)
            Service->>Service: buildConversionResult(amounts, rate, timestamp)
        end
    end
    
    Service-->>-Controller: ConversionResult
    Controller-->>-Usuario: 200 - Conversion result
```

## 2. Obtener Tasa de Cambio

```mermaid
---
title: Obtener Tasa de Cambio
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: GET /currency/rate?from=USD&to=COP
    Controller->>+Service: getExchangeRate(fromCurrency, toCurrency)
    
    alt Misma moneda
        Service-->>-Controller: 1
        Controller-->>-Usuario: 200 - Exchange rate: 1
    else Monedas diferentes
        Service->>Service: buildRateKey(fromCurrency, toCurrency)
        Service->>Service: rates.get(rateKey)
        
        alt Tasa no encontrada
            Service-->>Controller: Error: Exchange rate not found
            Controller-->>Usuario: 400 - Exchange rate not found
        else Tasa encontrada
            Service-->>-Controller: rate.rate
            Controller-->>-Usuario: 200 - Exchange rate
        end
    end
```

## 3. Actualizar Tasa de Cambio (Admin)

```mermaid
---
title: Actualizar Tasa de Cambio
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Admin->>+Controller: POST /currency/rates (updateRateDto)
    Controller->>+Service: updateExchangeRate(fromCurrency, toCurrency, newRate)
    
    Service->>Service: isSupportedCurrency(fromCurrency)
    Service->>Service: isSupportedCurrency(toCurrency)
    
    alt Moneda no soportada
        Service-->>Controller: Error: Currency not supported
        Controller-->>Admin: 400 - One or both currencies are not supported
    else Monedas soportadas
        Service->>Service: buildRateKey(fromCurrency, toCurrency)
        Service->>Service: rates.set(rateKey, {from, to, rate: newRate, lastUpdated: now})
        
        Service->>Service: buildReverseRateKey(toCurrency, fromCurrency)
        Service->>Service: calculateReverseRate(1 / newRate)
        Service->>Service: roundToDecimals(reverseRate, 6)
        Service->>Service: rates.set(reverseRateKey, {from: to, to: from, rate: reverseRate, lastUpdated: now})
        
        Service-->>-Controller: void
        Controller-->>-Admin: 200 - Exchange rate updated
    end
```

## 4. Formatear Monto según Moneda

```mermaid
---
title: Formatear Monto según Moneda
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: GET /currency/format?amount=1000000&currency=COP
    Controller->>+Service: formatAmount(amount, currency)
    
    Service->>Service: determineLocale(currency)
    Note over Service: COP -> 'es-CO'<br/>USD -> 'en-US'
    
    Service->>Service: Intl.NumberFormat(locale, {style: 'currency', currency, fractionDigits})
    Note over Service: COP: 0 decimales<br/>USD: 2 decimales
    
    Service->>Service: format(amount)
    
    Service-->>-Controller: formatted string
    Controller-->>-Usuario: 200 - Formatted amount (e.g., "$1.000.000")
```

## 5. Obtener Visualización en Doble Moneda

```mermaid
---
title: Obtener Visualización en Doble Moneda
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: GET /currency/dual-display?amount=100&currency=USD
    Controller->>+Service: getDualCurrencyDisplay(amount, baseCurrency)
    
    alt baseCurrency es COP
        Service->>Service: copAmount = amount
        Service->>+Service: convert(amount, 'COP', 'USD')
        Service-->>-Service: conversion result
        Service->>Service: usdAmount = conversion.convertedAmount
    else baseCurrency es USD
        Service->>Service: usdAmount = amount
        Service->>+Service: convert(amount, 'USD', 'COP')
        Service-->>-Service: conversion result
        Service->>Service: copAmount = conversion.convertedAmount
    end
    
    Service->>+Service: formatAmount(copAmount, 'COP')
    Service-->>-Service: copFormatted
    
    Service->>+Service: formatAmount(usdAmount, 'USD')
    Service-->>-Service: usdFormatted
    
    Service->>Service: buildDualCurrencyResponse(cop, usd)
    
    Service-->>-Controller: {cop: {amount, formatted}, usd: {amount, formatted}}
    Controller-->>-Usuario: 200 - Dual currency display
```

## 6. Obtener Monedas Soportadas

```mermaid
---
title: Obtener Monedas Soportadas
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: GET /currency/supported
    Controller->>+Service: getSupportedCurrencies()
    
    Service->>Service: return [...supportedCurrencies]
    
    Service-->>-Controller: ['COP', 'USD']
    Controller-->>-Usuario: 200 - Supported currencies
```

## 7. Obtener Todas las Tasas de Cambio

```mermaid
---
title: Obtener Todas las Tasas de Cambio
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as CurrencyController
    participant Service as CurrencyService

    Usuario->>+Controller: GET /currency/rates
    Controller->>+Service: getAllRates()
    
    Service->>Service: Array.from(rates.values())
    
    Service-->>-Controller: CurrencyRate[]
    Note over Controller: [{from: 'USD', to: 'COP', rate: 4200, lastUpdated},<br/>{from: 'COP', to: 'USD', rate: 0.000238, lastUpdated}]
    Controller-->>-Usuario: 200 - All exchange rates
```

## Descripción de Flujos

### 1. Convertir Monto entre Monedas

- Valida que ambas monedas estén soportadas (COP, USD)
- Si son iguales, retorna mismo monto con tasa 1
- Busca tasa de cambio en memoria (Map)
- Calcula monto convertido y redondea a 2 decimales
- Retorna resultado completo con montos, tasa y timestamp

### 2. Obtener Tasa de Cambio

- Retorna tasa de cambio entre dos monedas
- Si son iguales: retorna 1
- Busca en Map de tasas por clave (e.g., 'USD_COP')

### 3. Actualizar Tasa de Cambio (Admin)

- Solo para administradores
- Actualiza tasa directa (e.g., USD → COP)
- Calcula y actualiza tasa inversa automáticamente (e.g., COP → USD)
- Tasa inversa redondeada a 6 decimales
- Actualiza timestamp

### 4. Formatear Monto según Moneda

- Formatea monto según convenciones de la moneda
- COP: sin decimales, locale español Colombia
- USD: 2 decimales, locale inglés USA
- Usa Intl.NumberFormat nativo

### 5. Obtener Visualización en Doble Moneda

- Muestra monto en ambas monedas (COP y USD)
- Convierte automáticamente según moneda base
- Retorna montos y versiones formateadas
- Útil para displays de precios

### 6. Obtener Monedas Soportadas

- Retorna lista de monedas soportadas
- Actualmente: COP, USD
- Extensible para agregar más monedas

### 7. Obtener Todas las Tasas de Cambio

- Retorna todas las tasas configuradas
- Incluye tasas directas e inversas
- Muestra última actualización de cada tasa

## Patrones Implementados

- **In-Memory Cache Pattern**: Tasas almacenadas en Map para acceso rápido
- **Strategy Pattern**: Diferentes formatos por moneda
- **Factory Pattern**: Construcción de ConversionResult
- **Service Layer**: Lógica de conversión centralizada
- **Internationalization Pattern**: Uso de Intl.NumberFormat para formatos localizados
- **Bidirectional Mapping**: Actualización automática de tasas inversas
