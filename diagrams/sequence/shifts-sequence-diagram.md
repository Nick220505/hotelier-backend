# Diagrama de Secuencia - Módulo de Turnos

## 1. Crear Turno

```mermaid
---
title: Crear Turno
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as ShiftsController
    participant Service as ShiftsService
    participant ShiftRepo as ShiftRepository

    RRHH->>+Controller: POST /shifts (createShiftDto)
    Controller->>+Service: create(data)
    
    Service->>+ShiftRepo: save(shiftData)
    ShiftRepo-->>-Service: Shift
    
    Service-->>-Controller: Shift
    Controller-->>-RRHH: 201 - Shift created
```

## 2. Asignar Empleados a Turno

```mermaid
---
title: Asignar Empleados a Turno
---
sequenceDiagram
    autonumber
    actor Supervisor
    participant Controller as ShiftsController
    participant Service as ShiftsService
    participant ShiftRepo as ShiftRepository

    Supervisor->>+Controller: POST /shifts/:id/assign (employeeIds[])
    Controller->>+Service: assignEmployees(shiftId, employeeIds)
    
    Service->>+ShiftRepo: findOne({where: {id: shiftId}})
    ShiftRepo-->>-Service: Shift | null
    
    alt Turno no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Supervisor: 404 - Shift not found
    else Turno encontrado
        Service->>+ShiftRepo: update(shiftId, {employees: employeeIds})
        ShiftRepo-->>-Service: UpdateResult
        
        Service->>+ShiftRepo: findOne({where: {id: shiftId}, relations: ['employees']})
        ShiftRepo-->>-Service: Shift
        
        Service-->>-Controller: Shift
        Controller-->>-Supervisor: 200 - Employees assigned
    end
```

## 3. Consultar Turnos por Fecha

```mermaid
---
title: Consultar Turnos por Fecha
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as ShiftsController
    participant Service as ShiftsService
    participant ShiftRepo as ShiftRepository

    Gerente->>+Controller: GET /shifts/date/:date
    Controller->>+Service: findByDate(date)
    
    Service->>Service: calculateDateRange(date)
    
    Service->>+ShiftRepo: find({where: {date: Between(start, end)}, relations: ['employees'], order: {startTime: ASC}})
    ShiftRepo-->>-Service: Shift[]
    
    Service-->>-Controller: Shift[]
    Controller-->>-Gerente: 200 - Shifts for date
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Many-to-Many Pattern**: Relación shifts-employees
- **Date Range Pattern**: Búsquedas por rango de fechas
