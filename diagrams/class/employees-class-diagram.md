# Diagrama de Clases - Módulo de Personal

```mermaid
classDiagram
    %% Controllers
    class EmployeesController {
        -EmployeesService employeesService
        +create(createEmployeeDto) Promise~Employee~
        +findAll(department) Promise~Employee[]~
        +getHousekeepingEmployees() Promise~Employee[]~
        +getDepartmentStats() Promise~DepartmentStatsDto[]~
        +findOne(id) Promise~Employee~
        +update(id, updateEmployeeDto) Promise~Employee~
        +remove(id) Promise~Employee~
    }

    %% Services
    class EmployeesService {
        -Repository~Employee~ employeeRepository
        +create(data) Promise~Employee~
        +findAll() Promise~Employee[]~
        +findByDepartment(department) Promise~Employee[]~
        +findOne(id) Promise~Employee~
        +update(id, data) Promise~Employee~
        +delete(id) Promise~Employee~
        +getHousekeepingEmployees() Promise~Employee[]~
        +getEmployeesByStatus(isActive) Promise~Employee[]~
        +getDepartmentStats() Promise~DepartmentStatsDto[]~
    }

    %% Entities
    class Employee {
        +int id
        +string employeeId
        +string name
        +Department department
        +string position
        +string shift
        +int assignedRooms
        +int completedRooms
        +StaffStatus status
        +string currentLocation
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateEmployeeDto {
        +string employeeId
        +string name
        +Department department
        +string position
        +string shift
        +int assignedRooms
        +int completedRooms
        +StaffStatus status
        +string currentLocation
    }

    class UpdateEmployeeDto {
        +string employeeId
        +string name
        +Department department
        +string position
        +string shift
        +int assignedRooms
        +int completedRooms
        +StaffStatus status
        +string currentLocation
    }

    class DepartmentStatsDto {
        +Department department
        +int activeCount
        +int totalCount
    }

    %% Enumerations
    class Department {
        <<enumeration>>
        HOUSEKEEPING
        FRONT_DESK
        MAINTENANCE
        RESTAURANT
        KITCHEN
        ADMINISTRATION
        SECURITY
        MANAGEMENT
    }

    class StaffStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
        ON_LEAVE
        TERMINATED
    }

    %% Relationships
    EmployeesController --> EmployeesService : uses
    EmployeesController ..> CreateEmployeeDto : uses
    EmployeesController ..> UpdateEmployeeDto : uses
    EmployeesController ..> DepartmentStatsDto : returns
    
    EmployeesService --> Employee : manages
    EmployeesService ..> CreateEmployeeDto : creates from
    EmployeesService ..> UpdateEmployeeDto : updates from
    EmployeesService ..> DepartmentStatsDto : returns
    
    Employee --> Department : belongs to
    Employee --> StaffStatus : has status
    
    CreateEmployeeDto --> Department : department
    CreateEmployeeDto --> StaffStatus : status
    UpdateEmployeeDto --> Department : department
    UpdateEmployeeDto --> StaffStatus : status
    DepartmentStatsDto --> Department : department
    
    %% Notas de Patrones GoF
    note for StaffStatus "State Pattern (GoF)<br/>Estados de empleado:<br/>ACTIVE→ON_LEAVE→INACTIVE→TERMINATED"
    note for Department "Strategy Pattern (GoF)<br/>Diferentes responsabilidades<br/>según departamento"
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de personal:

### Controllers
- **EmployeesController**: Maneja las peticiones HTTP para empleados y estadísticas departamentales

### Services
- **EmployeesService**: Lógica de negocio para gestión de empleados, filtrado por departamento y estadísticas

### Entities
- **Employee**: Empleados operativos con seguimiento de tareas (habitaciones asignadas/completadas)

### DTOs
- **CreateEmployeeDto**: Datos para crear un nuevo empleado operativo
- **UpdateEmployeeDto**: Datos para actualizar un empleado operativo
- **DepartmentStatsDto**: Estadísticas de empleados por departamento

### Enumerations
- **Department**: Departamentos del hotel (HOUSEKEEPING, FRONT_DESK, MAINTENANCE, RESTAURANT, KITCHEN, ADMINISTRATION, SECURITY, MANAGEMENT)
- **StaffStatus**: Estados del personal (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)

## Patrones de Diseño GoF Implementados

### 1. State Pattern (Comportamiento)
**Aplicación**: `StaffStatus` enum
- **Beneficio**: Gestión clara del estado laboral del empleado
- **Estados**: ACTIVE → ON_LEAVE → INACTIVE → TERMINATED
- **Implementación**: Transiciones controladas según políticas de recursos humanos

### 2. Strategy Pattern (Comportamiento)
**Aplicación**: `Department` enum
- **Beneficio**: Diferentes comportamientos y responsabilidades según departamento
- **Estrategias**: HOUSEKEEPING, FRONT_DESK, MAINTENANCE, RESTAURANT, etc.
- **Implementación**: Permite aplicar reglas específicas por departamento
