# Diagrama de Secuencia - Módulo de Asistencia

## 1. Registrar Entrada (Check-In)

```mermaid
---
title: Registrar Entrada (Check-In)
---
sequenceDiagram
    autonumber
    actor Empleado
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    Empleado->>+Controller: POST /attendance/check-in/:employeeId (time)
    Controller->>+Service: checkIn(employeeId, time)
    
    Service->>Service: setTodayDate()
    Note over Service: today.setHours(0, 0, 0, 0)
    
    Service->>+AttendanceRepo: findOne({where: {employeeId, date: today}})
    AttendanceRepo-->>-Service: Attendance | null
    
    alt Ya registró entrada hoy
        Service->>+Service: update(existing.id, {checkIn: time})
        Service->>+AttendanceRepo: update(id, {checkIn: time})
        AttendanceRepo-->>-Service: UpdateResult
        Service->>+AttendanceRepo: findOne({where: {id}})
        AttendanceRepo-->>-Service: Updated Attendance
        Service-->>-Service: Attendance
    else Primera entrada del día
        Service->>+Service: create({employeeId, date: today, checkIn: time, status: PRESENT})
        Service->>+AttendanceRepo: save(attendanceData)
        AttendanceRepo-->>-Service: Attendance
        Service-->>-Service: Attendance
    end
    
    Service-->>-Controller: Attendance
    Controller-->>-Empleado: 201 - Check-in registered
```

## 2. Registrar Salida (Check-Out)

```mermaid
---
title: Registrar Salida (Check-Out)
---
sequenceDiagram
    autonumber
    actor Empleado
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    Empleado->>+Controller: POST /attendance/check-out/:employeeId (time)
    Controller->>+Service: checkOut(employeeId, time)
    
    Service->>Service: setTodayDate()
    Note over Service: today.setHours(0, 0, 0, 0)
    
    Service->>+AttendanceRepo: findOne({where: {employeeId, date: today}})
    AttendanceRepo-->>-Service: Attendance | null
    
    alt No hay registro de entrada
        Service-->>Controller: BadRequestException
        Controller-->>Empleado: 400 - No check-in found for today
    else Registro de entrada existe
        Service->>Service: calculateHoursWorked(checkIn, time)
        Note over Service: checkInTime = new Date('1970-01-01T' + checkIn + ':00')<br/>checkOutTime = new Date('1970-01-01T' + time + ':00')<br/>hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60)
        
        Service->>+Service: update(attendance.id, {checkOut: time, hoursWorked})
        Service->>+AttendanceRepo: update(id, {checkOut, hoursWorked})
        AttendanceRepo-->>-Service: UpdateResult
        Service->>+AttendanceRepo: findOne({where: {id}})
        AttendanceRepo-->>-Service: Updated Attendance
        Service-->>-Service: Attendance
        
        Service-->>-Controller: Attendance
        Controller-->>-Empleado: 201 - Check-out registered
    end
```

## 3. Consultar Asistencia por Empleado

```mermaid
---
title: Consultar Asistencia por Empleado
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    RRHH->>+Controller: GET /attendance/employee/:employeeId
    Controller->>+Service: findByEmployee(employeeId)
    
    Service->>+AttendanceRepo: find({where: {employeeId}, order: {date: DESC}})
    AttendanceRepo-->>-Service: Attendance[]
    
    Service-->>-Controller: Attendance[]
    Controller-->>-RRHH: 200 - Employee attendance records
```

## 4. Consultar Asistencia por Fecha

```mermaid
---
title: Consultar Asistencia por Fecha
---
sequenceDiagram
    autonumber
    actor Supervisor
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    Supervisor->>+Controller: GET /attendance/date/:date
    Controller->>+Service: findByDate(new Date(date))
    
    Service->>Service: calculateStartOfDay(date)
    Note over Service: startOfDay.setHours(0, 0, 0, 0)
    Service->>Service: calculateEndOfDay(date)
    Note over Service: endOfDay.setHours(23, 59, 59, 999)
    
    Service->>+AttendanceRepo: find({where: {date: Between(startOfDay, endOfDay)}, order: {date: ASC}})
    AttendanceRepo-->>-Service: Attendance[]
    
    Service-->>-Controller: Attendance[]
    Controller-->>-Supervisor: 200 - Attendance records for date
```

## 5. Consultar Asistencia por Rango de Fechas

```mermaid
---
title: Consultar Asistencia por Rango de Fechas
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    Gerente->>+Controller: GET /attendance/range/:startDate/:endDate
    Controller->>+Service: findByDateRange(new Date(startDate), new Date(endDate))
    
    Service->>+AttendanceRepo: find({where: {date: Between(startDate, endDate)}, order: {date: ASC}})
    AttendanceRepo-->>-Service: Attendance[]
    
    Service-->>-Controller: Attendance[]
    Controller-->>-Gerente: 200 - Attendance records in range
```

## 6. Consultar Asistencia por Estado

```mermaid
---
title: Consultar Asistencia por Estado
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    RRHH->>+Controller: GET /attendance/status/:status
    Controller->>+Service: findByStatus(status)
    
    Service->>+AttendanceRepo: find({where: {status}, order: {date: DESC}})
    AttendanceRepo-->>-Service: Attendance[]
    
    Service-->>-Controller: Attendance[]
    Controller-->>-RRHH: 200 - Attendance records by status
```

## 7. Crear Registro de Asistencia Manual

```mermaid
---
title: Crear Registro de Asistencia Manual
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    RRHH->>+Controller: POST /attendance (createAttendanceDto)
    Controller->>+Service: create(data)
    
    Service->>+AttendanceRepo: save(data)
    AttendanceRepo-->>-Service: Attendance
    
    Service-->>-Controller: Attendance
    Controller-->>-RRHH: 201 - Attendance record created
```

## 8. Actualizar Registro de Asistencia

```mermaid
---
title: Actualizar Registro de Asistencia
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    RRHH->>+Controller: PATCH /attendance/:id (updateAttendanceDto)
    Controller->>+Service: update(id, data)
    
    Service->>+AttendanceRepo: update(id, data)
    AttendanceRepo-->>-Service: UpdateResult
    
    Service->>+AttendanceRepo: findOne({where: {id}})
    AttendanceRepo-->>-Service: Attendance | null
    
    alt Registro no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Attendance with id not found
    else Registro encontrado
        Service-->>-Controller: Attendance
        Controller-->>-RRHH: 200 - Attendance record updated
    end
```

## 9. Eliminar Registro de Asistencia

```mermaid
---
title: Eliminar Registro de Asistencia
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as AttendanceController
    participant Service as AttendanceService
    participant AttendanceRepo as AttendanceRepository

    RRHH->>+Controller: DELETE /attendance/:id
    Controller->>+Service: remove(id)
    
    Service->>+AttendanceRepo: findOne({where: {id}})
    AttendanceRepo-->>-Service: Attendance | null
    
    alt Registro no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Attendance with id not found
    else Registro encontrado
        Service->>+AttendanceRepo: remove(attendance)
        AttendanceRepo-->>-Service: Attendance
        
        Service-->>-Controller: Attendance
        Controller-->>-RRHH: 200 - Attendance record deleted
    end
```

## Descripción de Flujos

### 1. Registrar Entrada (Check-In)

- Empleado registra su hora de entrada
- Sistema verifica si ya existe registro para hoy
- Si existe, actualiza la hora de entrada
- Si no existe, crea nuevo registro con estado PRESENT

### 2. Registrar Salida (Check-Out)

- Empleado registra su hora de salida
- Sistema busca registro de entrada del día
- Calcula horas trabajadas automáticamente
- Actualiza registro con hora de salida y horas trabajadas

### 3. Consultar Asistencia por Empleado

- Recupera historial completo de asistencia de un empleado
- Ordenado por fecha descendente (más reciente primero)

### 4. Consultar Asistencia por Fecha

- Consulta todos los registros de un día específico
- Calcula inicio y fin del día (00:00:00 - 23:59:59)
- Útil para supervisión diaria

### 5. Consultar Asistencia por Rango de Fechas

- Consulta registros en un período específico
- Ordenado cronológicamente ascendente
- Útil para reportes y análisis

### 6. Consultar Asistencia por Estado

- Filtra registros por estado (PRESENT, ABSENT, LATE, EXCUSED)
- Ordenado por fecha descendente
- Útil para identificar patrones de ausentismo

### 7. Crear Registro de Asistencia Manual

- RRHH puede crear registros manualmente
- Útil para correcciones o registros históricos

### 8. Actualizar Registro de Asistencia

- Permite modificar registros existentes
- Validación de existencia del registro

### 9. Eliminar Registro de Asistencia

- Eliminación física del registro
- Solo para correcciones administrativas

## Patrones Implementados

- **Repository Pattern**: Acceso a datos a través de repositorios
- **Service Layer**: Lógica de negocio centralizada
- **State Pattern**: Estados de asistencia (PRESENT, ABSENT, LATE, EXCUSED)
- **Business Logic**: Cálculo automático de horas trabajadas
- **Validation Pattern**: Validación de check-in previo antes de check-out
