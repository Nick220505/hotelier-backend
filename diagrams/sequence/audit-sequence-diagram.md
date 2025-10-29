# Diagrama de Secuencia - Módulo de Auditoría

## 1. Crear Registro de Auditoría

```mermaid
---
title: Crear Registro de Auditoría
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Admin->>+Controller: POST /audit (createAuditLogDto)
    Controller->>+Service: create(createAuditLogDto)
    
    Service->>+AuditRepo: create(createAuditLogDto)
    AuditRepo-->>-Service: AuditLog entity
    
    Service->>+AuditRepo: save(auditLog)
    AuditRepo-->>-Service: AuditLog
    
    Service-->>-Controller: AuditLog
    Controller-->>-Admin: 201 - Audit log created
```

## 2. Registrar Evento de Auditoría (Método Interno)

```mermaid
---
title: Registrar Evento de Auditoría
---
sequenceDiagram
    autonumber
    actor Sistema
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Sistema->>+Service: log({userId, action, resource, description, resourceId, details, userAgent})
    
    Service->>+AuditRepo: create(auditLogParams)
    AuditRepo-->>-Service: AuditLog entity
    
    Service->>+AuditRepo: save(auditLog)
    AuditRepo-->>-Service: AuditLog
    
    Service-->>-Sistema: AuditLog
```

## 3. Consultar Logs de Auditoría con Filtros

```mermaid
---
title: Consultar Logs de Auditoría con Filtros
---
sequenceDiagram
    autonumber
    actor Auditor
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Auditor->>+Controller: GET /audit?userId&action&resource&resourceId&startDate&endDate&search&skip&take&order
    Controller->>+Service: findAll(query)
    
    Service->>+AuditRepo: createQueryBuilder('auditLog')
    AuditRepo-->>-Service: QueryBuilder
    
    Service->>Service: leftJoinAndSelect('auditLog.user', 'user')
    Service->>Service: select([auditLog.*, user.id, user.name, user.email])
    
    opt userId filter
        Service->>Service: andWhere('auditLog.userId = :userId')
    end
    
    opt action filter
        Service->>Service: andWhere('auditLog.action = :action')
    end
    
    opt resource filter
        Service->>Service: andWhere('auditLog.resource = :resource')
    end
    
    opt resourceId filter
        Service->>Service: andWhere('auditLog.resourceId = :resourceId')
    end
    
    opt date range filter
        alt Both startDate and endDate
            Service->>Service: andWhere('auditLog.createdAt BETWEEN :startDate AND :endDate')
        else Only startDate
            Service->>Service: andWhere('auditLog.createdAt >= :startDate')
        else Only endDate
            Service->>Service: andWhere('auditLog.createdAt <= :endDate')
        end
    end
    
    opt search filter
        Service->>Service: andWhere('auditLog.description ILIKE :search')
    end
    
    Service->>Service: orderBy('auditLog.createdAt', order)
    Service->>Service: skip(query.skip || 0)
    Service->>Service: take(query.take || 50)
    
    Service->>+AuditRepo: getManyAndCount()
    AuditRepo-->>-Service: [AuditLog[], total]
    
    Service-->>-Controller: {data: AuditLog[], total: number}
    Controller-->>-Auditor: 200 - Audit logs with pagination
```

## 4. Obtener Estadísticas de Auditoría

```mermaid
---
title: Obtener Estadísticas de Auditoría
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Admin->>+Controller: GET /audit/statistics?days=30
    Controller->>+Service: getStatistics(days)
    
    Service->>Service: calculateStartDate(days)
    Note over Service: startDate = now - days
    
    Service->>+AuditRepo: count({where: {createdAt: Between(startDate, now)}})
    AuditRepo-->>-Service: totalLogs
    
    Service->>+AuditRepo: createQueryBuilder().select('action').addSelect('COUNT(*)').groupBy('action').getRawMany()
    AuditRepo-->>-Service: ActionSummaryResult[]
    
    Service->>+AuditRepo: createQueryBuilder().select('resource').addSelect('COUNT(*)').groupBy('resource').getRawMany()
    AuditRepo-->>-Service: ResourceSummaryResult[]
    
    Service->>+AuditRepo: createQueryBuilder().leftJoin('user').select('userName, userId').addSelect('COUNT(*)').groupBy('user.id, user.name').limit(10).getRawMany()
    AuditRepo-->>-Service: UserSummaryResult[]
    
    Service->>+AuditRepo: createQueryBuilder().select("DATE_TRUNC('day', createdAt)").addSelect('COUNT(*)').groupBy("DATE_TRUNC('day', createdAt)").getRawMany()
    AuditRepo-->>-Service: DateSummaryResult[]
    
    Service->>Service: buildStatisticsResponse(totalLogs, actionStats, resourceStats, userStats, dailyActivity)
    
    Service-->>-Controller: Statistics object
    Controller-->>-Admin: 200 - Audit statistics
```

## 5. Consultar Historial de Recurso Específico

```mermaid
---
title: Consultar Historial de Recurso Específico
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Usuario->>+Controller: GET /audit/resource/:resource/:resourceId
    Controller->>+Service: findByResource(resource, resourceId)
    
    Service->>+AuditRepo: find({where: {resource, resourceId}, relations: ['user'], order: {createdAt: DESC}})
    AuditRepo-->>-Service: AuditLog[]
    
    Service-->>-Controller: AuditLog[]
    Controller-->>-Usuario: 200 - Resource audit history
```

## 6. Consultar Actividad de Usuario

```mermaid
---
title: Consultar Actividad de Usuario
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Admin->>+Controller: GET /audit/user/:userId?limit=100
    Controller->>+Service: findByUser(userId, limit)
    
    Service->>+AuditRepo: find({where: {userId}, relations: ['user'], order: {createdAt: DESC}, take: limit})
    AuditRepo-->>-Service: AuditLog[]
    
    Service-->>-Controller: AuditLog[]
    Controller-->>-Admin: 200 - User audit history
```

## 7. Obtener Detalle de Log de Auditoría

```mermaid
---
title: Obtener Detalle de Log de Auditoría
---
sequenceDiagram
    autonumber
    actor Auditor
    participant Controller as AuditController
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Auditor->>+Controller: GET /audit/:id
    Controller->>+Service: findOne(id)
    
    Service->>+AuditRepo: findOne({where: {id}, relations: ['user']})
    AuditRepo-->>-Service: AuditLog | null
    
    Service-->>-Controller: AuditLog | null
    Controller-->>-Auditor: 200 - Audit log details
```

## 8. Limpiar Logs Antiguos (Mantenimiento)

```mermaid
---
title: Limpiar Logs Antiguos
---
sequenceDiagram
    autonumber
    actor Sistema
    participant Service as AuditService
    participant AuditRepo as AuditLogRepository

    Sistema->>+Service: cleanOldLogs(olderThanDays)
    
    Service->>Service: calculateCutoffDate(olderThanDays)
    Note over Service: cutoffDate = now - olderThanDays
    
    Service->>+AuditRepo: delete({createdAt: Between('1970-01-01', cutoffDate)})
    AuditRepo-->>-Service: DeleteResult
    
    Service->>Service: extractAffectedCount(result)
    
    Service-->>-Sistema: affected count
```

## Descripción de Flujos

### 1. Crear Registro de Auditoría

- Permite crear logs de auditoría manualmente
- Útil para eventos del sistema que requieren registro explícito
- Guarda información completa del evento

### 2. Registrar Evento de Auditoría (Método Interno)

- Método utilizado internamente por el sistema
- Registra automáticamente acciones de usuarios
- Incluye: userId, action, resource, description, resourceId, details, userAgent
- Usado por el decorador @AuditLog en otros controladores

### 3. Consultar Logs de Auditoría con Filtros

- Sistema avanzado de búsqueda y filtrado
- Filtros disponibles: userId, action, resource, resourceId, fechas, búsqueda de texto
- Soporte para paginación (skip/take)
- Ordenamiento configurable (ASC/DESC)
- Incluye información del usuario relacionado

### 4. Obtener Estadísticas de Auditoría

- Genera estadísticas agregadas para período especificado
- Incluye:
  - Total de logs
  - Distribución por acción (CREATE, UPDATE, DELETE, etc.)
  - Distribución por recurso (USER, RESERVATION, ROOM, etc.)
  - Top 10 usuarios más activos
  - Actividad diaria (timeline)
- Útil para dashboards y reportes de seguridad

### 5. Consultar Historial de Recurso Específico

- Obtiene todo el historial de cambios de un recurso
- Útil para trazabilidad de entidades específicas
- Ordenado cronológicamente (más reciente primero)
- Incluye información del usuario que realizó cada acción

### 6. Consultar Actividad de Usuario

- Obtiene historial de acciones de un usuario específico
- Limitado a un número máximo de registros (default: 100)
- Ordenado cronológicamente descendente
- Útil para análisis de comportamiento y auditorías

### 7. Obtener Detalle de Log de Auditoría

- Recupera información detallada de un log específico
- Incluye campo 'details' con información adicional del evento
- Incluye relación con usuario

### 8. Limpiar Logs Antiguos (Mantenimiento)

- Proceso de mantenimiento para eliminar logs antiguos
- Evita crecimiento descontrolado de la base de datos
- Default: elimina logs más antiguos de 365 días
- Retorna cantidad de registros eliminados

## Patrones Implementados

- **Repository Pattern**: Acceso a datos a través de repositorios
- **Query Builder Pattern**: Construcción dinámica de consultas complejas
- **Observer Pattern**: Sistema de auditoría automática mediante decoradores
- **Decorator Pattern**: @AuditLog para registro automático de eventos
- **Aggregate Pattern**: Estadísticas y resúmenes de datos de auditoría
- **Data Retention Pattern**: Limpieza automática de datos históricos
