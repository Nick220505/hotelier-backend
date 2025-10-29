# Diagrama de Secuencia - Módulo de Reportes

## 1. Generar Reporte de Ocupación

```mermaid
---
title: Generar Reporte de Ocupación
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as ReportsController
    participant Service as ReportsService
    participant ReservationRepo as ReservationRepository
    participant RoomRepo as RoomRepository

    Gerente->>+Controller: GET /reports/occupancy?startDate&endDate
    Controller->>+Service: generateOccupancyReport(startDate, endDate)
    
    Service->>+RoomRepo: count()
    RoomRepo-->>-Service: totalRooms
    
    Service->>+ReservationRepo: find({where: {checkInDate: Between(startDate, endDate)}})
    ReservationRepo-->>-Service: Reservation[]
    
    Service->>Service: calculateOccupancyRate(reservations, totalRooms, days)
    Service->>Service: buildOccupancyReportDto(rate, totalRooms, occupiedRooms, period)
    
    Service-->>-Controller: OccupancyReportDto
    Controller-->>-Gerente: 200 - Occupancy report
```

## 2. Generar Reporte de Ingresos

```mermaid
---
title: Generar Reporte de Ingresos
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as ReportsController
    participant Service as ReportsService
    participant InvoiceRepo as InvoiceRepository

    Gerente->>+Controller: GET /reports/revenue?startDate&endDate
    Controller->>+Service: generateRevenueReport(startDate, endDate)
    
    Service->>+InvoiceRepo: find({where: {createdAt: Between(startDate, endDate)}})
    InvoiceRepo-->>-Service: Invoice[]
    
    Service->>Service: calculateTotalRevenue(invoices)
    Service->>Service: groupByCategory(invoices)
    Service->>Service: calculateAverageRevenue(total, days)
    Service->>Service: buildRevenueReportDto(metrics)
    
    Service-->>-Controller: RevenueReportDto
    Controller-->>-Gerente: 200 - Revenue report
```

## 3. Generar Reporte de Empleados

```mermaid
---
title: Generar Reporte de Empleados
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as ReportsController
    participant Service as ReportsService
    participant EmployeeRepo as EmployeeRepository

    RRHH->>+Controller: GET /reports/employees
    Controller->>+Service: generateEmployeeReport()
    
    Service->>+EmployeeRepo: find()
    EmployeeRepo-->>-Service: Employee[]
    
    Service->>Service: groupByDepartment(employees)
    Service->>Service: countByStatus(employees)
    Service->>Service: buildEmployeeReportDto(metrics)
    
    Service-->>-Controller: EmployeeReportDto
    Controller-->>-RRHH: 200 - Employee report
```

## Patrones Implementados

- **Report Pattern**: Generación de reportes estructurados
- **Aggregate Pattern**: Cálculos agregados de métricas
- **Repository Pattern**: Acceso a datos
- **DTO Pattern**: Transferencia de datos de reportes
