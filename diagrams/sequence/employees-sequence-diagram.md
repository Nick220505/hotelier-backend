# Diagrama de Secuencia - Módulo de Personal (Employees)

## 1. Crear Empleado

```mermaid
---
title: Crear Empleado
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    RRHH->>+Controller: POST /employees (createEmployeeDto)
    Controller->>+Service: create(data)
    
    Service->>Service: validateEmployeeData()
    Service->>Service: setDefaultStatus(ACTIVE)
    
    Service->>+EmployeeRepo: save(employeeData)
    EmployeeRepo-->>-Service: Employee
    
    Service-->>-Controller: Employee
    Controller-->>-RRHH: 201 - Employee created
```

## 2. Consultar Empleados por Departamento

```mermaid
---
title: Consultar Empleados por Departamento
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    Gerente->>+Controller: GET /employees?department=HOUSEKEEPING
    Controller->>+Service: findByDepartment(department)
    
    Service->>+EmployeeRepo: find({where: {department}, order: {name: ASC}})
    EmployeeRepo-->>-Service: Employee[]
    
    Service-->>-Controller: Employee[]
    Controller-->>-Gerente: 200 - Employees by department
```

## 3. Actualizar Estado de Empleado

```mermaid
---
title: Actualizar Estado de Empleado
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    Admin->>+Controller: PATCH /employees/:id (updateEmployeeDto)
    Controller->>+Service: update(id, data)
    
    Service->>+EmployeeRepo: findOne({where: {id}})
    EmployeeRepo-->>-Service: Employee
    
    alt Empleado no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Employee not found
    else Empleado encontrado
        alt Cambio de estado a ON_LEAVE
            Service->>Service: validateLeaveRequest()
            Service->>Service: clearCurrentAssignments()
        else Cambio de estado a INACTIVE
            Service->>Service: clearAllAssignments()
        else Cambio de estado a TERMINATED
            Service->>Service: processTermination()
            Service->>Service: clearAllAssignments()
        end
        
        Service->>+EmployeeRepo: update(id, data)
        EmployeeRepo-->>-Service: UpdateResult
        
        Service->>+EmployeeRepo: findOne({where: {id}})
        EmployeeRepo-->>-Service: Updated Employee
        
        Service-->>-Controller: Employee
        Controller-->>-RRHH: 200 - Employee updated
    end
```

## 4. Obtener Estadísticas por Departamento

```mermaid
---
title: Obtener Estadísticas por Departamento
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    Admin->>+Controller: GET /employees/department-stats
    Controller->>+Service: getDepartmentStats()
    
    loop Para cada departamento
        Service->>+EmployeeRepo: count(department, status = ACTIVE)
        EmployeeRepo-->>-Service: activeCount
        
        Service->>+EmployeeRepo: count(department)
        EmployeeRepo-->>-Service: totalCount
        
        Service->>Service: buildDepartmentStats(dept, active, total)
    end
    
    Service-->>-Controller: DepartmentStatsDto[]
    Controller-->>-Admin: 200 - Department statistics
```

## 5. Consultar Empleados de Limpieza (Housekeeping)

```mermaid
---
title: Consultar Empleados de Limpieza
---
sequenceDiagram
    autonumber
    actor SupervisorLimpieza
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    SupervisorLimpieza->>+Controller: GET /employees/housekeeping
    Controller->>+Service: getHousekeepingEmployees()
    
    Service->>+EmployeeRepo: find(department = HOUSEKEEPING)
    EmployeeRepo-->>-Service: Employee[]
    
    Service-->>-Controller: Employee[]
    Note over Controller: Incluye: assignedRooms,<br/>completedRooms, status,<br/>currentLocation
    Controller-->>-SupervisorLimpieza: 200 - Housekeeping employees
```

## 6. Actualizar Asignación de Habitaciones

```mermaid
---
title: Actualizar Asignación de Habitaciones
---
sequenceDiagram
    autonumber
    actor Supervisor
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    Supervisor->>+Controller: PATCH /employees/:id (assignedRooms: 5)
    Controller->>+Service: update(id, {assignedRooms: 5})
    
    Service->>+EmployeeRepo: findOne(id)
    EmployeeRepo-->>-Service: Employee
    
    alt Empleado no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Supervisor: 404 - Employee not found
    else Empleado encontrado
        Service->>Service: validateEmployeeIsActive()
        Service->>Service: validateDepartment(HOUSEKEEPING)
        
        Service->>+EmployeeRepo: update(id, {assignedRooms: 5})
        EmployeeRepo-->>-Service: UpdateResult
        
        Service->>+EmployeeRepo: findOne(id)
        EmployeeRepo-->>-Service: Updated Employee
        
        Service-->>-Controller: Employee
        Controller-->>-Supervisor: 200 - Rooms assigned
    end
```

## 7. Eliminar Empleado (Soft Delete)

```mermaid
---
title: Eliminar Empleado
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as EmployeesController
    participant Service as EmployeesService
    participant EmployeeRepo as EmployeeRepository

    Admin->>+Controller: DELETE /employees/:id
    Controller->>+Service: delete(id)
    
    Service->>+EmployeeRepo: findOne({where: {id}})
    EmployeeRepo-->>-Service: Employee
    
    alt Empleado no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Employee not found
    else Empleado encontrado
        Service->>Service: clearAllAssignments()
        
        Service->>+EmployeeRepo: update(id, {status: TERMINATED})
        EmployeeRepo-->>-Service: UpdateResult
        
        Service->>+EmployeeRepo: findOne(id)
        EmployeeRepo-->>-Service: Terminated Employee
        
        Service-->>-Controller: Employee
        Controller-->>-RRHH: 200 - Employee terminated
    end
```

## Descripción de Flujos

### 1. Crear Empleado

- RRHH registra nuevo empleado
- Se validan datos básicos
- Estado inicial es ACTIVE por defecto
- Se asigna departamento y posición

### 2. Consultar Empleados por Departamento

- Filtrado por departamento específico
- Útil para supervisores de área
- Retorna lista de empleados del departamento

### 3. Actualizar Estado de Empleado

- Permite cambios de estado laboral
- ON_LEAVE: Limpia asignaciones actuales
- INACTIVE/TERMINATED: Limpia todas las asignaciones
- Validaciones según tipo de cambio

### 4. Obtener Estadísticas por Departamento

- Calcula empleados activos vs total por departamento
- Vista general de recursos humanos
- Útil para planificación de personal

### 5. Consultar Empleados de Limpieza (Housekeeping)

- Consulta específica para departamento de limpieza
- Incluye información de habitaciones asignadas/completadas
- Tracking de ubicación actual

### 6. Actualizar Asignación de Habitaciones

- Asigna habitaciones a empleados de limpieza
- Validación de departamento y estado activo
- Actualiza contador de habitaciones asignadas

### 7. Eliminar Empleado (Soft Delete)

- No elimina físicamente el registro
- Cambia estado a TERMINATED
- Limpia todas las asignaciones pendientes
- Mantiene historial para auditoría

## Patrones Implementados

- **State Pattern**: Estados de empleado (ACTIVE, INACTIVE, ON_LEAVE, TERMINATED)
- **Strategy Pattern**: Diferentes comportamientos por departamento
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Service Layer**: Lógica de negocio centralizada
- **Soft Delete Pattern**: Desactivación en lugar de eliminación física
