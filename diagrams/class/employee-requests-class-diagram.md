# Diagrama de Clases - Módulo de Solicitudes de Empleados

```mermaid
classDiagram
    %% Controllers
    class EmployeeRequestsController {
        -EmployeeRequestsService employeeRequestsService
        +findAll() Promise~EmployeeRequest[]~
        +findOne(id) Promise~EmployeeRequest~
        +findByEmployee(employeeId) Promise~EmployeeRequest[]~
        +findByStatus(status) Promise~EmployeeRequest[]~
        +findPending() Promise~EmployeeRequest[]~
        +create(createDto) Promise~EmployeeRequest~
        +update(id, updateDto) Promise~EmployeeRequest~
        +approve(id, reviewedBy, comments) Promise~EmployeeRequest~
        +reject(id, reviewedBy, comments) Promise~EmployeeRequest~
        +remove(id) Promise~EmployeeRequest~
    }

    %% Services
    class EmployeeRequestsService {
        -Repository~EmployeeRequest~ requestRepository
        +findAll() Promise~EmployeeRequest[]~
        +findOne(id) Promise~EmployeeRequest~
        +findByEmployee(employeeId) Promise~EmployeeRequest[]~
        +findByStatus(status) Promise~EmployeeRequest[]~
        +findPending() Promise~EmployeeRequest[]~
        +create(data) Promise~EmployeeRequest~
        +update(id, data) Promise~EmployeeRequest~
        +approve(id, reviewedBy, comments) Promise~EmployeeRequest~
        +reject(id, reviewedBy, comments) Promise~EmployeeRequest~
        +remove(id) Promise~EmployeeRequest~
    }

    %% Entities
    class EmployeeRequest {
        +int id
        +RequestType type
        +string reason
        +Date startDate
        +Date endDate
        +number daysRequested
        +RequestStatus status
        +int employeeId
        +string reviewedBy
        +string reviewComments
        +Date reviewedAt
        +Date createdAt
        +Date updatedAt
        +Employee employee
    }

    class Employee {
        +int id
        +string name
        +string department
    }

    %% DTOs
    class CreateEmployeeRequestDto {
        +RequestType type
        +string reason
        +Date startDate
        +Date endDate
        +int employeeId
    }

    class UpdateEmployeeRequestDto {
        +RequestType type
        +string reason
        +Date startDate
        +Date endDate
        +RequestStatus status
        +string reviewedBy
        +string reviewComments
    }

    %% Enumerations
    class RequestType {
        <<enumeration>>
        VACATION
        SICK_LEAVE
        PERSONAL
        OTHER
    }

    class RequestStatus {
        <<enumeration>>
        PENDING
        APPROVED
        REJECTED
        CANCELLED
    }

    %% Relationships
    EmployeeRequestsController --> EmployeeRequestsService : uses
    EmployeeRequestsController ..> CreateEmployeeRequestDto : receives
    EmployeeRequestsController ..> UpdateEmployeeRequestDto : receives
    
    EmployeeRequestsService --> EmployeeRequest : manages
    EmployeeRequestsService ..> CreateEmployeeRequestDto : creates from
    EmployeeRequestsService ..> UpdateEmployeeRequestDto : updates from
    
    EmployeeRequest --> RequestType : type
    EmployeeRequest --> RequestStatus : status
    EmployeeRequest --> Employee : requested by
    
    CreateEmployeeRequestDto --> RequestType : type
    UpdateEmployeeRequestDto --> RequestType : type
    UpdateEmployeeRequestDto --> RequestStatus : status
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de solicitudes de empleados:

### Controllers
- **EmployeeRequestsController**: Maneja peticiones HTTP para gestión de solicitudes de permisos de empleados

### Services
- **EmployeeRequestsService**: Lógica de negocio para solicitudes de empleados
  - Operaciones CRUD de solicitudes
  - Filtrado por empleado y estado
  - Aprobación y rechazo de solicitudes
  - Obtención de solicitudes pendientes

### Entities
- **EmployeeRequest**: Solicitud de permiso de empleado
  - Tipo de solicitud (vacaciones, enfermedad, personal, otro)
  - Razón y fechas
  - Días solicitados calculados
  - Estado de la solicitud
  - Empleado solicitante
  - Información de revisión (quién, comentarios, fecha)
- **Employee**: Empleado que realiza la solicitud

### DTOs
- **CreateEmployeeRequestDto**: Datos para crear solicitud
- **UpdateEmployeeRequestDto**: Datos para actualizar solicitud

### Enumerations
- **RequestType**: Tipos de solicitud
  - VACATION: Vacaciones
  - SICK_LEAVE: Licencia médica
  - PERSONAL: Personal
  - OTHER: Otro
- **RequestStatus**: Estados de solicitud
  - PENDING: Pendiente
  - APPROVED: Aprobada
  - REJECTED: Rechazada
  - CANCELLED: Cancelada

### Funcionalidades Principales
- Gestión de solicitudes de permisos de empleados
- Múltiples tipos de solicitudes (vacaciones, enfermedad, personal)
- Workflow de aprobación/rechazo
- Tracking de quién revisó y comentarios
- Cálculo automático de días solicitados
- Filtrado por estado y empleado
- Historial completo de solicitudes
