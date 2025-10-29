# Diagrama de Secuencia - Módulo de Dashboard

## 1. Obtener Estadísticas del Dashboard

```mermaid
---
title: Obtener Estadísticas del Dashboard
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as DashboardController
    participant Service as DashboardService
    participant AuthService
    participant RoomRepo as RoomRepository
    participant EmployeeRepo as EmployeeRepository
    participant RequestRepo as GuestRequestRepository
    participant ReservationRepo as ReservationRepository
    participant InvoiceRepo as InvoiceRepository

    Usuario->>+Controller: GET /dashboard/stats (Bearer token)
    Controller->>+Service: getDashboardStats(user.id)
    
    Service->>+AuthService: validateUser(userId)
    AuthService-->>-Service: User | null
    
    alt Usuario no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - User not found
    else Usuario encontrado
        par Consultas paralelas
            Service->>+RoomRepo: count()
            RoomRepo-->>-Service: totalRooms
        and
            Service->>+RoomRepo: count({where: {isAvailable: true}})
            RoomRepo-->>-Service: availableRooms
        and
            Service->>+EmployeeRepo: count({where: {status: ACTIVE}})
            EmployeeRepo-->>-Service: activeStaff
        and
            Service->>+RequestRepo: count({where: {status: PENDING}})
            RequestRepo-->>-Service: pendingRequests
        end
        
        Service->>Service: calculateOccupiedRooms(totalRooms - availableRooms)
        
        Service->>Service: calculateDateRange(last 30 days)
        Service->>+InvoiceRepo: createQueryBuilder().select('SUM(total)').where('createdAt BETWEEN :start AND :end').getRawOne()
        InvoiceRepo-->>-Service: {total: string}
        Service->>Service: parseFloat(total) || 0
        
        Service->>Service: calculateTodayRange(00:00:00 - 23:59:59)
        par Consultas check-in/check-out
            Service->>+ReservationRepo: count({where: {checkInDate: Between(dayStart, dayEnd)}})
            ReservationRepo-->>-Service: todayCheckIns
        and
            Service->>+ReservationRepo: count({where: {checkOutDate: Between(dayStart, dayEnd)}})
            ReservationRepo-->>-Service: todayCheckOuts
        end
        
        Service->>Service: buildDashboardStatsDto(metrics)
        
        Service-->>-Controller: DashboardStatsDto
        Controller-->>-Usuario: 200 - Dashboard statistics
    end
```

## 2. Obtener Actividades Recientes

```mermaid
---
title: Obtener Actividades Recientes
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as DashboardController
    participant Service as DashboardService
    participant AuthService
    participant ReservationRepo as ReservationRepository
    participant InvoiceRepo as InvoiceRepository
    participant CleaningRepo as CleaningAssignmentRepository
    participant RequestRepo as GuestRequestRepository

    Usuario->>+Controller: GET /dashboard/activity (Bearer token)
    Controller->>+Service: getRecentActivities(user.id)
    
    Service->>+AuthService: validateUser(userId)
    AuthService-->>-Service: User | null
    
    alt Usuario no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - User not found
    else Usuario encontrado
        par Consultas paralelas
            Service->>+ReservationRepo: find({order: {createdAt: DESC}, take: 5})
            ReservationRepo-->>-Service: recentReservations[]
        and
            Service->>+InvoiceRepo: find({order: {createdAt: DESC}, take: 5})
            InvoiceRepo-->>-Service: recentInvoices[]
        and
            Service->>+CleaningRepo: find({order: {completedAt: DESC}, take: 5})
            CleaningRepo-->>-Service: recentAssignments[]
        and
            Service->>+RequestRepo: find({order: {createdAt: DESC}, take: 5})
            RequestRepo-->>-Service: recentRequests[]
        end
        
        Service->>Service: transformToActivityDtos(all records)
        Note over Service: Tipo 'booking': reservas<br/>Tipo 'payment': facturas<br/>Tipo 'maintenance': limpieza<br/>Tipo 'request': solicitudes
        
        Service->>Service: sortByTimestamp(activities, DESC)
        Service->>Service: slice(0, 12)
        
        Service-->>-Controller: RecentActivityDto[]
        Controller-->>-Usuario: 200 - Recent activities
    end
```

## 3. Obtener Datos de Ingresos

```mermaid
---
title: Obtener Datos de Ingresos
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as DashboardController
    participant Service as DashboardService
    participant AuthService
    participant InvoiceRepo as InvoiceRepository

    Usuario->>+Controller: GET /dashboard/revenue (Bearer token)
    Controller->>+Service: getRevenueData(user.id)
    
    Service->>+AuthService: validateUser(userId)
    AuthService-->>-Service: User | null
    
    alt Usuario no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - User not found
    else Usuario encontrado
        Service->>Service: calculateStartDate(today - 6 days)
        
        Service->>+InvoiceRepo: find({where: {createdAt: MoreThanOrEqual(start)}})
        InvoiceRepo-->>-Service: invoices[]
        
        Service->>Service: groupByDate(invoices)
        Note over Service: byDate: {<br/>'2024-01-15': 15000,<br/>'2024-01-16': 12000<br/>}
        
        Service->>Service: buildRevenueDataArray(7 days)
        Note over Service: Para cada día:<br/>- Fecha en formato ISO<br/>- Revenue del mapa o 0
        
        Service-->>-Controller: RevenueDataDto[]
        Controller-->>-Usuario: 200 - Revenue data (last 7 days)
    end
```

## Descripción de Flujos

### 1. Obtener Estadísticas del Dashboard

- Valida usuario autenticado
- Consultas paralelas para optimizar rendimiento:
  - Total de habitaciones
  - Habitaciones disponibles
  - Personal activo
  - Solicitudes pendientes
- Calcula habitaciones ocupadas (total - disponibles)
- Suma ingresos de últimos 30 días
- Cuenta check-ins y check-outs del día actual
- Retorna métricas consolidadas para dashboard

### 2. Obtener Actividades Recientes

- Valida usuario autenticado
- Consulta las 5 actividades más recientes de cada tipo:
  - Reservas (booking)
  - Facturas (payment)
  - Asignaciones de limpieza (maintenance)
  - Solicitudes de huéspedes (request)
- Transforma a formato uniforme RecentActivityDto
- Ordena por timestamp descendente
- Retorna las 12 más recientes

### 3. Obtener Datos de Ingresos

- Valida usuario autenticado
- Consulta facturas de últimos 7 días
- Agrupa por fecha y suma totales
- Genera array de 7 días con revenue diario
- Días sin factur as muestran 0
- Útil para gráficos de ingresos

## Patrones Implementados

- **Aggregate Pattern**: Consolidación de estadísticas de múltiples fuentes
- **Repository Pattern**: Acceso a datos a través de repositorios
- **DTO Pattern**: Transferencia de datos estructurada
- **Parallel Execution**: Consultas paralelas para optimizar rendimiento
- **Authorization Pattern**: Validación de usuario autenticado
- **Time-Series Pattern**: Datos organizados por fecha para gráficos
