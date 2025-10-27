# Diagrama de Clases - Módulo de Reportes

```mermaid
classDiagram
    %% Controllers
    class ReportsController {
        -ReportsService reportsService
        +findAll() Promise~Report[]~
        +getReportsByType(type) Promise~Report[]~
        +getReportsByStatus(status) Promise~Report[]~
        +getReportsByDateRange(startDate, endDate) Promise~Report[]~
        +findOne(id) Promise~Report~
        +create(createReportDto) Promise~Report~
        +generateOccupancyReport(startDate, endDate, generatedBy) Promise~Report~
        +generateRevenueReport(startDate, endDate, generatedBy) Promise~Report~
        +generateGuestSatisfactionReport(startDate, endDate, generatedBy) Promise~Report~
        +update(id, updateReportDto) Promise~Report~
        +updateStatus(id, status) Promise~Report~
        +remove(id) Promise~Report~
        +getFinancialSummary(startDate, endDate) Promise~object~
        +getOccupancyByMonthYear(year, month) Promise~object~
        +getMonthlyRevenueComparison(year) Promise~object~
        +downloadFinancialReport(year, month) Promise~StreamableFile~
    }

    %% Services
    class ReportsService {
        -Repository~Report~ reportRepository
        -Repository~Invoice~ invoiceRepository
        -Repository~Reservation~ reservationRepository
        +create(data) Promise~Report~
        +findAll() Promise~Report[]~
        +findOne(id) Promise~Report~
        +findByType(type) Promise~Report[]~
        +findByStatus(status) Promise~Report[]~
        +findByDateRange(startDate, endDate) Promise~Report[]~
        +updateStatus(id, status) Promise~Report~
        +update(id, data) Promise~Report~
        +remove(id) Promise~Report~
        +generateOccupancyReport(startDate, endDate, generatedBy) Promise~Report~
        +generateRevenueReport(startDate, endDate, generatedBy) Promise~Report~
        +generateGuestReport(startDate, endDate, generatedBy) Promise~Report~
        +getFinancialSummary(startDate, endDate) Promise~object~
        +getOccupancyByMonthYear(year, month) Promise~object~
        +getMonthlyRevenueComparison(year) Promise~object~
        +generateFinancialReportPDF(year, month) Promise~StreamableFile~
        -drawTable(doc, data) void
        -getMonthName(month) string
    }

    %% Entities
    class Report {
        +int id
        +string title
        +ReportType type
        +ReportStatus status
        +Date startDate
        +Date endDate
        +object parameters
        +object data
        +string filePath
        +string generatedBy
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateReportDto {
        +string title
        +ReportType type
        +ReportStatus status
        +Date startDate
        +Date endDate
        +object parameters
        +object data
        +string filePath
        +string generatedBy
    }

    class UpdateReportDto {
        +string title
        +ReportType type
        +ReportStatus status
        +Date startDate
        +Date endDate
        +object parameters
        +object data
        +string filePath
        +string generatedBy
    }

    class ReportParametersDto {
        +string[] departments
        +string[] roomTypes
        +string[] channels
        +boolean includeDetails
        +string groupBy
        +string format
    }

    class OccupancyReportDataDto {
        +int totalRooms
        +int occupiedRooms
        +decimal occupancyRate
        +int availableRooms
        +object[] dailyOccupancy
    }

    class RevenueReportDataDto {
        +decimal totalRevenue
        +decimal roomRevenue
        +decimal restaurantRevenue
        +decimal servicesRevenue
        +decimal eventsRevenue
        +object[] revenueByCategory
        +object[] dailyRevenue
    }

    %% Enumerations
    class ReportType {
        <<enumeration>>
        OCCUPANCY
        REVENUE
        GUEST_STATISTICS
        EMPLOYEE_PERFORMANCE
        INVENTORY
        FINANCIAL
        BOOKING_CHANNEL
        ROOM_STATUS
    }

    class ReportStatus {
        <<enumeration>>
        PENDING
        GENERATING
        COMPLETED
        FAILED
        CANCELLED
    }

    %% Relationships
    ReportsController --> ReportsService : uses
    ReportsController ..> CreateReportDto : uses
    ReportsController ..> UpdateReportDto : uses
    
    ReportsService --> Report : manages
    ReportsService ..> OccupancyReportDataDto : generates
    ReportsService ..> RevenueReportDataDto : generates
    
    Report --> ReportType : type
    Report --> ReportStatus : status
    Report ..> ReportParametersDto : parameters
    Report ..> OccupancyReportDataDto : data
    Report ..> RevenueReportDataDto : data
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de reportes:

### Controllers
- **ReportsController**: Maneja las peticiones HTTP para gestión de reportes, generación de reportes específicos y análisis financieros

### Services
- **ReportsService**: Lógica de negocio para creación de reportes, análisis de ocupación, ingresos y generación de PDFs

### Entities
- **Report**: Entidad principal que representa un reporte generado o en proceso
  - Almacena datos en formato JSON
  - Guarda la ruta del archivo generado
  - Rastrea quién generó el reporte

### DTOs
- **CreateReportDto**: Datos para crear un nuevo reporte
- **UpdateReportDto**: Datos para actualizar un reporte existente
- **ReportParametersDto**: Parámetros configurables para personalizar los reportes
- **OccupancyReportDataDto**: Datos específicos de reportes de ocupación
- **RevenueReportDataDto**: Datos específicos de reportes de ingresos

### Enumerations
- **ReportType**: Tipos de reportes disponibles
  - OCCUPANCY: Reportes de ocupación
  - REVENUE: Reportes de ingresos
  - GUEST_STATISTICS: Estadísticas de huéspedes
  - EMPLOYEE_PERFORMANCE: Rendimiento de empleados
  - INVENTORY: Inventario
  - FINANCIAL: Reportes financieros
  - BOOKING_CHANNEL: Canales de reserva
  - ROOM_STATUS: Estado de habitaciones

- **ReportStatus**: Estados del proceso de generación
  - PENDING: Pendiente de generación
  - GENERATING: En proceso de generación
  - COMPLETED: Completado exitosamente
  - FAILED: Falló la generación
  - CANCELLED: Cancelado

### Funcionalidades Principales
- Generación de reportes de ocupación
- Generación de reportes de ingresos
- Análisis financiero por período
- Comparación mensual de ingresos
- Generación de PDFs con datos financieros
- Estadísticas de huéspedes
