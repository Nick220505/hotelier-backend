# Diagrama de Clases - Módulo de Auditoría

```mermaid
classDiagram
    %% Controllers
    class AuditController {
        -AuditService auditService
        +findAll(query) Promise~object~
        +getActionSummary() Promise~object[]~
        +getResourceSummary() Promise~object[]~
        +getUserActivity() Promise~object[]~
        +getRecentActivity() Promise~AuditLog[]~
        +getActivityByDateRange(startDate, endDate) Promise~AuditLog[]~
    }

    %% Services
    class AuditService {
        -Repository~AuditLog~ auditLogRepository
        +log(params) Promise~AuditLog~
        +create(createAuditLogDto) Promise~AuditLog~
        +findAll(query) Promise~object~
        +getActionSummary() Promise~object[]~
        +getResourceSummary() Promise~object[]~
        +getUserActivity() Promise~object[]~
        +getRecentActivity(limit) Promise~AuditLog[]~
        +getActivityByDateRange(startDate, endDate) Promise~AuditLog[]~
        +getActivityByUser(userId, limit) Promise~AuditLog[]~
        +getActivityByResource(resource) Promise~AuditLog[]~
    }

    %% Entities
    class AuditLog {
        +int id
        +int userId
        +AuditAction action
        +AuditResource resource
        +string resourceId
        +string userAgent
        +object details
        +string description
        +Date createdAt
    }

    class User {
        +int id
        +string name
        +string email
    }

    %% DTOs
    class CreateAuditLogDto {
        +int userId
        +AuditAction action
        +AuditResource resource
        +string resourceId
        +string userAgent
        +object details
        +string description
    }

    class AuditLogQueryDto {
        +int userId
        +AuditAction action
        +AuditResource resource
        +string resourceId
        +Date startDate
        +Date endDate
        +int page
        +int limit
        +string sortBy
        +string sortOrder
    }

    class AuditLogParams {
        <<interface>>
        +int userId
        +AuditAction action
        +AuditResource resource
        +string description
        +string resourceId
        +object details
        +string userAgent
    }

    %% Enumerations
    class AuditAction {
        <<enumeration>>
        CREATE
        READ
        UPDATE
        DELETE
        LOGIN
        LOGOUT
        LOGIN_FAILED
        PASSWORD_CHANGE
        PASSWORD_RESET
        CHECK_IN
        CHECK_OUT
        CANCEL_RESERVATION
        PAYMENT_PROCESSED
        REFUND_ISSUED
        INVOICE_GENERATED
        STATUS_CHANGE
        APPROVAL
        REJECTION
        SYSTEM_CONFIG_CHANGE
        PERMISSION_GRANTED
        PERMISSION_REVOKED
        ROLE_ASSIGNED
        ROLE_REMOVED
        FILE_UPLOAD
        FILE_DOWNLOAD
        FILE_DELETE
        REPORT_GENERATED
        EXPORT
        CUSTOM
    }

    class AuditResource {
        <<enumeration>>
        USER
        ROLE
        PERMISSION
        RESERVATION
        ROOM
        GUEST
        INVOICE
        PAYMENT
        BILLING
        EMPLOYEE
        SHIFT
        ATTENDANCE
        HOUSEKEEPING
        MAINTENANCE
        RESTAURANT
        MENU_ITEM
        ROOM_SERVICE
        EVENT
        VENUE
        RECREATIONAL
        INVENTORY
        SUPPLIER
        PARKING
        GUEST_REQUEST
        EMPLOYEE_REQUEST
        REPORT
        ANALYTICS
        CONFIGURATION
        NOTIFICATION
        AUDIT_LOG
        SYSTEM
        OTHER
    }

    %% Relationships
    AuditController --> AuditService : uses
    AuditController ..> AuditLogQueryDto : uses
    
    AuditService --> AuditLog : manages
    AuditService ..> CreateAuditLogDto : creates from
    AuditService ..> AuditLogQueryDto : filters with
    AuditService ..> AuditLogParams : uses
    
    User "1" --o "0..*" AuditLog : performs actions
    AuditLog --> User : belongs to
    AuditLog --> AuditAction : action
    AuditLog --> AuditResource : resource
    
    CreateAuditLogDto --> AuditAction : action
    CreateAuditLogDto --> AuditResource : resource
    AuditLogQueryDto --> AuditAction : action filter
    AuditLogQueryDto --> AuditResource : resource filter
    AuditLogParams --> AuditAction : action
    AuditLogParams --> AuditResource : resource
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de auditoría:

### Controllers
- **AuditController**: Maneja las peticiones HTTP para consulta de logs de auditoría y estadísticas

### Services
- **AuditService**: Lógica de negocio para registro y consulta de logs de auditoría, generación de resúmenes

### Entities
- **AuditLog**: Registro de auditoría de acciones del sistema
  - Usuario que realizó la acción
  - Tipo de acción y recurso afectado
  - Detalles adicionales en JSON
  - User agent y metadatos
- **User**: Usuario que realizó la acción

### DTOs
- **CreateAuditLogDto**: Datos para crear un log de auditoría
- **AuditLogQueryDto**: Filtros y paginación para consultas
- **AuditLogParams**: Interface para parámetros de logging

### Enumerations
- **AuditAction**: Acciones auditadas (CRUD, autenticación, pagos, etc.)
- **AuditResource**: Recursos del sistema que se auditan

### Funcionalidades Principales
- Registro automático de acciones del sistema
- Consulta de logs con múltiples filtros
- Resúmenes de actividad por acción/recurso/usuario
- Análisis de actividad por rangos de fechas
- Seguimiento de cambios en recursos
- Auditoría de autenticación y seguridad
