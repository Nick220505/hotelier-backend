# Diagrama de Clases - Módulo de Reportes y Analítica

```mermaid
classDiagram
    %% Controllers
    class ReportsAnalyticsController {
        -ReportsAnalyticsService reportsAnalyticsService
        +create(createData) Promise~AnalyticsData~
        +findOne(id) Promise~AnalyticsData~
        +update(id, updateData) Promise~AnalyticsData~
        +remove(id) Promise~AnalyticsData~
        +getDashboardSummary(period) Promise~DashboardSummaryResponseDto~
        +getMetricTotal(metric, startDate, endDate) Promise~TotalMetricResultDto~
        +getMetricAverage(metric, startDate, endDate) Promise~AverageMetricResultDto~
        +getDistinctPeriods(metric) Promise~DistinctMetricResultDto[]~
        +getTrendData(metric, startDate, endDate) Promise~AnalyticsData[]~
    }

    %% Services
    class ReportsAnalyticsService {
        -Repository~AnalyticsData~ analyticsRepository
        +create(data) Promise~AnalyticsData~
        +findOne(id) Promise~AnalyticsData~
        +update(id, data) Promise~AnalyticsData~
        +remove(id) Promise~AnalyticsData~
        +getDashboardSummary(period) Promise~DashboardSummaryResponseDto~
        +getTotalForMetric(metric, startDate, endDate) Promise~number~
        +getAverageForMetric(metric, startDate, endDate) Promise~number~
        +getDistinctPeriodsForMetric(metric) Promise~string[]~
        +getTrendData(metric, startDate, endDate) Promise~AnalyticsData[]~
        +findByMetric(metric) Promise~AnalyticsData[]~
        +findByPeriod(period) Promise~AnalyticsData[]~
    }

    %% Entities
    class AnalyticsData {
        +int id
        +AnalyticsMetric metric
        +number value
        +Date date
        +string period
        +object metadata
        +string source
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateAnalyticsDataDto {
        +AnalyticsMetric metric
        +number value
        +Date date
        +string period
        +object metadata
        +string source
    }

    class UpdateAnalyticsDataDto {
        +AnalyticsMetric metric
        +number value
        +Date date
        +string period
        +object metadata
        +string source
    }

    class DashboardSummaryResponseDto {
        +number OCCUPANCY_RATE
        +number REVENUE_PER_ROOM
        +number CUSTOMER_SATISFACTION
        +number AVERAGE_STAY_LENGTH
        +number REPEAT_CUSTOMER_RATE
        +number STAFF_EFFICIENCY
    }

    class TotalMetricResultDto {
        +string metric
        +number total
        +int count
    }

    class AverageMetricResultDto {
        +string metric
        +number average
        +int count
    }

    class DistinctMetricResultDto {
        +string period
        +number value
        +Date date
    }

    %% Enumerations
    class AnalyticsMetric {
        <<enumeration>>
        OCCUPANCY_RATE
        REVENUE_PER_ROOM
        CUSTOMER_SATISFACTION
        AVERAGE_STAY_LENGTH
        REPEAT_CUSTOMER_RATE
        STAFF_EFFICIENCY
    }

    %% Relationships
    ReportsAnalyticsController --> ReportsAnalyticsService : uses
    ReportsAnalyticsController ..> CreateAnalyticsDataDto : receives
    ReportsAnalyticsController ..> UpdateAnalyticsDataDto : receives
    ReportsAnalyticsController ..> DashboardSummaryResponseDto : returns
    ReportsAnalyticsController ..> TotalMetricResultDto : returns
    ReportsAnalyticsController ..> AverageMetricResultDto : returns
    ReportsAnalyticsController ..> DistinctMetricResultDto : returns
    
    ReportsAnalyticsService --> AnalyticsData : manages
    ReportsAnalyticsService ..> CreateAnalyticsDataDto : creates from
    ReportsAnalyticsService ..> UpdateAnalyticsDataDto : updates from
    ReportsAnalyticsService ..> DashboardSummaryResponseDto : builds
    ReportsAnalyticsService ..> TotalMetricResultDto : builds
    ReportsAnalyticsService ..> AverageMetricResultDto : builds
    ReportsAnalyticsService ..> DistinctMetricResultDto : builds
    
    AnalyticsData --> AnalyticsMetric : metric
    CreateAnalyticsDataDto --> AnalyticsMetric : metric
    UpdateAnalyticsDataDto --> AnalyticsMetric : metric
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de reportes y analítica:

### Controllers
- **ReportsAnalyticsController**: Maneja peticiones HTTP para datos analíticos y métricas del hotel

### Services
- **ReportsAnalyticsService**: Lógica de negocio para analítica
  - Gestión de datos analíticos (CRUD)
  - Resumen de dashboard con métricas clave
  - Cálculos de totales y promedios por métrica
  - Datos de tendencias por período
  - Filtrado por métrica y período

### Entities
- **AnalyticsData**: Punto de dato analítico
  - Tipo de métrica
  - Valor numérico
  - Fecha y período
  - Metadata adicional (JSON)
  - Fuente del dato

### DTOs
- **CreateAnalyticsDataDto**: Datos para crear registro analítico
- **UpdateAnalyticsDataDto**: Datos para actualizar registro analítico
- **DashboardSummaryResponseDto**: Resumen de métricas para dashboard
  - Tasa de ocupación
  - Ingresos por habitación
  - Satisfacción del cliente
  - Duración promedio de estadía
  - Tasa de clientes recurrentes
  - Eficiencia del personal
- **TotalMetricResultDto**: Resultado de total de métrica
- **AverageMetricResultDto**: Resultado de promedio de métrica
- **DistinctMetricResultDto**: Resultado de períodos distintos

### Enumerations
- **AnalyticsMetric**: Métricas analíticas
  - OCCUPANCY_RATE: Tasa de ocupación
  - REVENUE_PER_ROOM: Ingresos por habitación
  - CUSTOMER_SATISFACTION: Satisfacción del cliente
  - AVERAGE_STAY_LENGTH: Duración promedio de estadía
  - REPEAT_CUSTOMER_RATE: Tasa de clientes recurrentes
  - STAFF_EFFICIENCY: Eficiencia del personal

### Funcionalidades Principales
- Sistema de analítica y KPIs del hotel
- Tracking de métricas clave de desempeño
- Resumen de dashboard con métricas principales
- Cálculos estadísticos (totales, promedios)
- Análisis de tendencias temporales
- Agrupación por períodos (diario, semanal, mensual, trimestral)
- Metadata flexible para contexto adicional
- Tracking de fuente de datos
- Reportes históricos y comparativos
