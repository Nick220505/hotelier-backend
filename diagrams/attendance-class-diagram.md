# Diagrama de Clases - Módulo de Asistencia

```mermaid
classDiagram
    %% Controllers
    class AttendanceController {
        -AttendanceService attendanceService
        +findAll() Promise~Attendance[]~
        +findOne(id) Promise~Attendance~
        +findByEmployee(employeeId) Promise~Attendance[]~
        +findByDate(date) Promise~Attendance[]~
        +findByDateRange(startDate, endDate) Promise~Attendance[]~
        +findByStatus(status) Promise~Attendance[]~
        +create(data) Promise~Attendance~
        +update(id, data) Promise~Attendance~
        +remove(id) Promise~Attendance~
        +checkIn(employeeId, checkInData) Promise~Attendance~
        +checkOut(employeeId, checkOutData) Promise~Attendance~
    }

    %% Services
    class AttendanceService {
        -Repository~Attendance~ attendanceRepository
        +create(data) Promise~Attendance~
        +findAll() Promise~Attendance[]~
        +findOne(id) Promise~Attendance~
        +findByEmployee(employeeId) Promise~Attendance[]~
        +findByDate(date) Promise~Attendance[]~
        +findByDateRange(startDate, endDate) Promise~Attendance[]~
        +findByStatus(status) Promise~Attendance[]~
        +update(id, data) Promise~Attendance~
        +remove(id) Promise~Attendance~
        +checkIn(employeeId, time) Promise~Attendance~
        +checkOut(employeeId, time) Promise~Attendance~
    }

    %% Entities
    class Attendance {
        +int id
        +Date date
        +string checkIn
        +string checkOut
        +AttendanceStatus status
        +string notes
        +decimal hoursWorked
        +decimal overtimeHours
        +Date createdAt
        +Date updatedAt
        +int employeeId
    }

    class Employee {
        +int id
        +string employeeId
        +string name
        +Department department
    }

    %% DTOs
    class CreateAttendanceDto {
        +Date date
        +string checkIn
        +string checkOut
        +AttendanceStatus status
        +string notes
        +decimal hoursWorked
        +decimal overtimeHours
        +int employeeId
    }

    class UpdateAttendanceDto {
        +Date date
        +string checkIn
        +string checkOut
        +AttendanceStatus status
        +string notes
        +decimal hoursWorked
        +decimal overtimeHours
    }

    class CheckInOutDto {
        +string time
    }

    %% Enumerations
    class AttendanceStatus {
        <<enumeration>>
        PRESENT
        ABSENT
        LATE
        EARLY_LEAVE
        SICK_LEAVE
        VACATION
    }

    %% Relationships
    AttendanceController --> AttendanceService : uses
    AttendanceController ..> CreateAttendanceDto : uses
    AttendanceController ..> UpdateAttendanceDto : uses
    AttendanceController ..> CheckInOutDto : uses
    
    AttendanceService --> Attendance : manages
    AttendanceService ..> CreateAttendanceDto : creates from
    AttendanceService ..> UpdateAttendanceDto : updates from
    
    Employee "1" --o "0..*" Attendance : has records
    Attendance --> AttendanceStatus : status
    Attendance --> Employee : belongs to
    
    CreateAttendanceDto --> AttendanceStatus : status
    UpdateAttendanceDto --> AttendanceStatus : status
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de asistencia:

### Controllers
- **AttendanceController**: Maneja las peticiones HTTP para gestión de registros de asistencia, check-in/check-out

### Services
- **AttendanceService**: Lógica de negocio para CRUD de asistencia, filtrado por empleado/fecha/estado, y cálculo de horas trabajadas

### Entities
- **Attendance**: Registro de asistencia de un empleado
  - Fecha y horas de entrada/salida
  - Estado de asistencia
  - Horas trabajadas y extras
  - Notas adicionales
- **Employee**: Empleado asociado al registro

### DTOs
- **CreateAttendanceDto**: Datos para crear un registro de asistencia
- **UpdateAttendanceDto**: Datos para actualizar un registro de asistencia
- **CheckInOutDto**: Datos para check-in/check-out (solo hora)

### Enumerations
- **AttendanceStatus**: Estados de asistencia
  - PRESENT: Presente
  - ABSENT: Ausente
  - LATE: Llegada tarde
  - EARLY_LEAVE: Salida temprana
  - SICK_LEAVE: Licencia por enfermedad
  - VACATION: Vacaciones

### Funcionalidades Principales
- Registro de asistencia diaria
- Check-in y check-out de empleados
- Cálculo automático de horas trabajadas
- Filtrado por empleado, fecha y estado
- Registro de horas extras
- Notas y observaciones
