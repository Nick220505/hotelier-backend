# Diagrama de Clases - Módulo de Turnos (Shifts)

```mermaid
classDiagram
    %% Controllers
    class ShiftsController {
        -ShiftsService shiftsService
        +findAll() Promise~Shift[]~
        +findOne(id) Promise~Shift~
        +findByEmployee(employeeId) Promise~Shift[]~
        +findByDateRange(start, end) Promise~Shift[]~
        +findByStatus(status) Promise~Shift[]~
        +create(createShiftDto) Promise~Shift~
        +update(id, updateShiftDto) Promise~Shift~
        +remove(id) Promise~Shift~
    }

    %% Services
    class ShiftsService {
        -Repository~Shift~ shiftRepository
        +findAll() Promise~Shift[]~
        +findOne(id) Promise~Shift~
        +findByEmployee(employeeId) Promise~Shift[]~
        +findByDateRange(start, end) Promise~Shift[]~
        +findByStatus(status) Promise~Shift[]~
        +create(data) Promise~Shift~
        +update(id, data) Promise~Shift~
        +remove(id) Promise~Shift~
    }

    %% Entities
    class Shift {
        +int id
        +Date date
        +string startTime
        +string endTime
        +ShiftType type
        +ShiftStatus status
        +int employeeId
        +string notes
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
    class CreateShiftDto {
        +Date date
        +string startTime
        +string endTime
        +ShiftType type
        +int employeeId
        +string notes
    }

    class UpdateShiftDto {
        +Date date
        +string startTime
        +string endTime
        +ShiftType type
        +ShiftStatus status
        +int employeeId
        +string notes
    }

    %% Enumerations
    class ShiftType {
        <<enumeration>>
        MORNING
        AFTERNOON
        EVENING
        NIGHT
        SPLIT
    }

    class ShiftStatus {
        <<enumeration>>
        SCHEDULED
        ACTIVE
        COMPLETED
        CANCELLED
        NO_SHOW
    }

    %% Relationships
    ShiftsController --> ShiftsService : uses
    ShiftsController ..> CreateShiftDto : receives
    ShiftsController ..> UpdateShiftDto : receives
    
    ShiftsService --> Shift : manages
    ShiftsService ..> CreateShiftDto : creates from
    ShiftsService ..> UpdateShiftDto : updates from
    
    Shift --> ShiftType : type
    Shift --> ShiftStatus : status
    Shift --> Employee : assigned to
    
    CreateShiftDto --> ShiftType : type
    UpdateShiftDto --> ShiftType : type
    UpdateShiftDto --> ShiftStatus : status
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de turnos:

### Controllers
- **ShiftsController**: Maneja peticiones HTTP para gestión de turnos de empleados

### Services
- **ShiftsService**: Lógica de negocio para turnos
  - Operaciones CRUD de turnos
  - Búsqueda por empleado
  - Filtrado por rango de fechas
  - Filtrado por estado

### Entities
- **Shift**: Turno de trabajo
  - Fecha y horario (inicio/fin)
  - Tipo de turno
  - Estado del turno
  - Empleado asignado
  - Notas adicionales
- **Employee**: Empleado asignado al turno

### DTOs
- **CreateShiftDto**: Datos para crear turno
- **UpdateShiftDto**: Datos para actualizar turno

### Enumerations
- **ShiftType**: Tipos de turno
  - MORNING: Mañana
  - AFTERNOON: Tarde
  - EVENING: Noche temprana
  - NIGHT: Noche
  - SPLIT: Turno dividido
- **ShiftStatus**: Estados de turno
  - SCHEDULED: Programado
  - ACTIVE: Activo (en curso)
  - COMPLETED: Completado
  - CANCELLED: Cancelado
  - NO_SHOW: No se presentó

### Funcionalidades Principales
- Gestión de turnos de empleados
- Programación de horarios
- Tracking de estado de turnos
- Filtrado por empleado, fecha y estado
- Diferentes tipos de turnos (mañana, tarde, noche, dividido)
- Notas adicionales por turno
