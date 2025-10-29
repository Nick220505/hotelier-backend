# Diagrama de Secuencia - Módulo de Analíticas y Reportes

## 1. Obtener Análisis de Ingresos por Período

```mermaid
---
title: Análisis de Ingresos por Período
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as ReportsAnalyticsController
    participant Service as ReportsAnalyticsService
    participant InvoiceRepo as InvoiceRepository

    Gerente->>+Controller: GET /reports-analytics/revenue-analysis?period=monthly
    Controller->>+Service: getRevenueAnalysis(period)
    
    Service->>Service: calculatePeriodRange(period)
    
    Service->>+InvoiceRepo: find({where: {createdAt: Between(start, end)}})
    InvoiceRepo-->>-Service: Invoice[]
    
    Service->>Service: groupByTimePeriod(invoices, period)
    Note over Service: period: daily, weekly, monthly, yearly
    
    Service->>Service: calculateTrends(groupedData)
    Service->>Service: calculateGrowthRate(current, previous)
    Service->>Service: buildRevenueAnalysisDto(data, trends, growth)
    
    Service-->>-Controller: RevenueAnalysisDto
    Controller-->>-Gerente: 200 - Revenue analysis
```

## 2. Obtener KPIs del Hotel

```mermaid
---
title: Obtener KPIs del Hotel
---
sequenceDiagram
    autonumber
    actor Ejecutivo
    participant Controller as ReportsAnalyticsController
    participant Service as ReportsAnalyticsService
    participant DB as Multiple Repositories

    Ejecutivo->>+Controller: GET /reports-analytics/kpis
    Controller->>+Service: getHotelKPIs()
    
    par Cálculo paralelo de KPIs
        Service->>+DB: Calculate Occupancy Rate
        DB-->>-Service: occupancyRate
    and
        Service->>+DB: Calculate ADR (Average Daily Rate)
        DB-->>-Service: adr
    and
        Service->>+DB: Calculate RevPAR (Revenue per Available Room)
        DB-->>-Service: revpar
    and
        Service->>+DB: Calculate Guest Satisfaction
        DB-->>-Service: satisfactionScore
    and
        Service->>+DB: Calculate Staff Efficiency
        DB-->>-Service: staffEfficiency
    end
    
    Service->>Service: buildKPIsDto(metrics)
    
    Service-->>-Controller: HotelKPIsDto
    Controller-->>-Ejecutivo: 200 - Hotel KPIs
```

## 3. Análisis Predictivo de Ocupación

```mermaid
---
title: Análisis Predictivo de Ocupación
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as ReportsAnalyticsController
    participant Service as ReportsAnalyticsService
    participant ReservationRepo as ReservationRepository

    Gerente->>+Controller: GET /reports-analytics/occupancy-prediction?days=30
    Controller->>+Service: predictOccupancy(days)
    
    Service->>Service: getHistoricalData(lastYear)
    
    Service->>+ReservationRepo: find({where: {checkInDate: Between(lastYear, now)}})
    ReservationRepo-->>-Service: historicalReservations[]
    
    Service->>Service: calculateSeasonalPatterns(historicalData)
    Service->>Service: applyTrendAnalysis(patterns)
    Service->>Service: generatePredictions(days, trends, patterns)
    Service->>Service: buildPredictionDto(predictions, confidence)
    
    Service-->>-Controller: OccupancyPredictionDto
    Controller-->>-Gerente: 200 - Occupancy prediction
```

## 4. Análisis de Segmentación de Clientes

```mermaid
---
title: Análisis de Segmentación de Clientes
---
sequenceDiagram
    autonumber
    actor Marketing
    participant Controller as ReportsAnalyticsController
    participant Service as ReportsAnalyticsService
    participant GuestRepo as GuestRepository
    participant ReservationRepo as ReservationRepository

    Marketing->>+Controller: GET /reports-analytics/customer-segments
    Controller->>+Service: getCustomerSegmentation()
    
    Service->>+GuestRepo: find()
    GuestRepo-->>-Service: Guest[]
    
    Service->>+ReservationRepo: find()
    ReservationRepo-->>-Service: Reservation[]
    
    Service->>Service: analyzeBookingPatterns(guests, reservations)
    Service->>Service: calculateLifetimeValue(guests, reservations)
    Service->>Service: segmentByBehavior(patterns, ltv)
    Note over Service: Segmentos: VIP, Frecuente,<br/>Ocasional, Nuevo
    
    Service->>Service: buildSegmentationDto(segments, metrics)
    
    Service-->>-Controller: CustomerSegmentationDto
    Controller-->>-Marketing: 200 - Customer segmentation
```

## Patrones Implementados

- **Analytics Pattern**: Análisis de datos complejos
- **Time-Series Pattern**: Análisis temporal de datos
- **Prediction Pattern**: Análisis predictivo basado en históricos
- **Segmentation Pattern**: Segmentación de clientes
- **KPI Pattern**: Métricas clave de rendimiento
- **Aggregate Pattern**: Cálculos agregados complejos
