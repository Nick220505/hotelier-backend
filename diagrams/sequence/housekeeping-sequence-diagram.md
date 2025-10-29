# Diagrama de Secuencia - Módulo de Limpieza (Housekeeping)

## 1. Crear Asignación de Limpieza

```mermaid
---
title: Crear Asignación de Limpieza
---
sequenceDiagram
    autonumber
    actor Supervisor
    participant Controller as HousekeepingController
    participant Service as HousekeepingService
    participant AssignmentRepo as CleaningAssignmentRepository
    participant RoomRepo as RoomRepository
    participant Notifications as NotificationsService

    Supervisor->>+Controller: POST /housekeeping/cleaning-assignments (createAssignmentDto)
    Controller->>+Service: createCleaningAssignment(data)
    
    Service->>+Service: generateAssignmentNumber()
    Service-->>-Service: assignmentNumber
    
    Service->>+AssignmentRepo: save({...data, assignmentNumber, status: PENDING})
    AssignmentRepo-->>-Service: CleaningAssignment
    
    Service->>+RoomRepo: update(roomId, {isAvailable: false})
    RoomRepo-->>-Service: UpdateResult
    
    Service->>+Notifications: createSystemAlert(title, message, refId, refType)
    Notifications-->>-Service: Notification
    
    Service-->>-Controller: CleaningAssignment
    Controller-->>-Supervisor: 201 - Cleaning assignment created
```

## 2. Marcar Asignación como Completada

```mermaid
---
title: Marcar Asignación como Completada
---
sequenceDiagram
    autonumber
    actor Empleado
    participant Controller as HousekeepingController
    participant Service as HousekeepingService
    participant AssignmentRepo as CleaningAssignmentRepository
    participant RoomRepo as RoomRepository

    Empleado->>+Controller: PUT /housekeeping/cleaning-assignments/:id/complete
    Controller->>+Service: completeCleaningAssignment(id)
    
    Service->>+AssignmentRepo: findOne({where: {id}})
    AssignmentRepo-->>-Service: CleaningAssignment | null
    
    alt Asignación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Empleado: 404 - Assignment not found
    else Asignación encontrada
        Service->>+AssignmentRepo: update(id, {status: COMPLETED, completedAt: now})
        AssignmentRepo-->>-Service: UpdateResult
        
        Service->>+RoomRepo: update(roomId, {isAvailable: true, status: CLEAN})
        RoomRepo-->>-Service: UpdateResult
        
        Service->>+AssignmentRepo: findOne({where: {id}})
        AssignmentRepo-->>-Service: CleaningAssignment
        
        Service-->>-Controller: CleaningAssignment
        Controller-->>-Empleado: 200 - Assignment completed
    end
```

## 3. Crear Reporte de Mantenimiento

```mermaid
---
title: Crear Reporte de Mantenimiento
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as HousekeepingController
    participant Service as HousekeepingService
    participant ReportRepo as MaintenanceReportRepository

    Personal->>+Controller: POST /housekeeping/maintenance-reports (createReportDto)
    Controller->>+Service: createMaintenanceReport(data)
    
    Service->>+Service: generateReportNumber()
    Service-->>-Service: reportNumber
    
    Service->>Service: setDefaultValues(status: PENDING, reportedDate: now)
    
    Service->>+ReportRepo: save({...data, reportNumber, status, reportedDate})
    ReportRepo-->>-Service: MaintenanceReport
    
    Service-->>-Controller: MaintenanceReport
    Controller-->>-Personal: 201 - Maintenance report created
```

## 4. Obtener Estadísticas de Limpieza

```mermaid
---
title: Obtener Estadísticas de Limpieza
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as HousekeepingController
    participant Service as HousekeepingService
    participant AssignmentRepo as CleaningAssignmentRepository

    Gerente->>+Controller: GET /housekeeping/statistics
    Controller->>+Service: getHousekeepingStatistics()
    
    Service->>+AssignmentRepo: count({where: {status: PENDING}})
    AssignmentRepo-->>-Service: pendingAssignments
    
    Service->>+AssignmentRepo: count({where: {status: IN_PROGRESS}})
    AssignmentRepo-->>-Service: inProgressAssignments
    
    Service->>+AssignmentRepo: count({where: {status: COMPLETED}})
    AssignmentRepo-->>-Service: completedAssignments
    
    Service->>Service: calculateAverageCompletionTime()
    Service->>Service: calculateQualityScore()
    
    Service->>Service: buildHousekeepingStatisticsDto(metrics)
    
    Service-->>-Controller: HousekeepingStatisticsDto
    Controller-->>-Gerente: 200 - Housekeeping statistics
```

## Descripción de Flujos

### 1. Crear Asignación de Limpieza

- Genera número de asignación único
- Crea asignación con estado PENDING
- Marca habitación como no disponible
- Envía notificación al empleado asignado

### 2. Marcar Asignación como Completada

- Valida existencia de asignación
- Actualiza estado a COMPLETED con timestamp
- Marca habitación como disponible y limpia
- Retorna asignación actualizada

### 3. Crear Reporte de Mantenimiento

- Genera número de reporte único
- Establece estado inicial PENDING
- Registra fecha de reporte
- Útil para tracking de problemas

### 4. Obtener Estadísticas de Limpieza

- Cuenta asignaciones por estado
- Calcula tiempo promedio de completación
- Calcula puntaje de calidad
- Retorna métricas consolidadas

## Patrones Implementados

- **State Pattern**: Estados de asignación (PENDING, IN_PROGRESS, COMPLETED)
- **Observer Pattern**: Notificaciones automáticas
- **Repository Pattern**: Acceso a datos
- **Aggregate Pattern**: Estadísticas de limpieza
- **Factory Pattern**: Generación de números de asignación/reporte
