# Diagrama de Secuencia - Módulo de Solicitudes de Empleados

## 1. Crear Solicitud de Empleado

```mermaid
---
title: Crear Solicitud de Empleado
---
sequenceDiagram
    autonumber
    actor Empleado
    participant Controller as EmployeeRequestsController
    participant Service as EmployeeRequestsService
    participant RequestRepo as EmployeeRequestRepository

    Empleado->>+Controller: POST /employee-requests (createRequestDto)
    Controller->>+Service: create(data)
    
    Service->>Service: setDefaultValues(status: PENDING, requestDate: now)
    
    Service->>+RequestRepo: save(requestData)
    RequestRepo-->>-Service: EmployeeRequest
    
    Service-->>-Controller: EmployeeRequest
    Controller-->>-Empleado: 201 - Request created
```

## 2. Aprobar Solicitud

```mermaid
---
title: Aprobar Solicitud
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as EmployeeRequestsController
    participant Service as EmployeeRequestsService
    participant RequestRepo as EmployeeRequestRepository

    RRHH->>+Controller: PUT /employee-requests/:id/approve (approvalNotes)
    Controller->>+Service: approveRequest(id, approvedBy, approvalNotes)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: EmployeeRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {status: APPROVED, approvedBy, approvedAt: now, approvalNotes})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: EmployeeRequest
        
        Service-->>-Controller: EmployeeRequest
        Controller-->>-RRHH: 200 - Request approved
    end
```

## 3. Rechazar Solicitud

```mermaid
---
title: Rechazar Solicitud
---
sequenceDiagram
    autonumber
    actor RRHH
    participant Controller as EmployeeRequestsController
    participant Service as EmployeeRequestsService
    participant RequestRepo as EmployeeRequestRepository

    RRHH->>+Controller: PUT /employee-requests/:id/reject (rejectionReason)
    Controller->>+Service: rejectRequest(id, rejectedBy, rejectionReason)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: EmployeeRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>RRHH: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {status: REJECTED, rejectedBy, rejectedAt: now, rejectionReason})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: EmployeeRequest
        
        Service-->>-Controller: EmployeeRequest
        Controller-->>-RRHH: 200 - Request rejected
    end
```

## 4. Listar Solicitudes por Empleado

```mermaid
---
title: Listar Solicitudes por Empleado
---
sequenceDiagram
    autonumber
    actor Empleado
    participant Controller as EmployeeRequestsController
    participant Service as EmployeeRequestsService
    participant RequestRepo as EmployeeRequestRepository

    Empleado->>+Controller: GET /employee-requests/employee/:employeeId
    Controller->>+Service: findByEmployee(employeeId)
    
    Service->>+RequestRepo: find({where: {employeeId}, order: {requestDate: DESC}})
    RequestRepo-->>-Service: EmployeeRequest[]
    
    Service-->>-Controller: EmployeeRequest[]
    Controller-->>-Empleado: 200 - Employee requests
```

## Patrones Implementados

- **State Pattern**: Estados de solicitud (PENDING, APPROVED, REJECTED)
- **Approval Pattern**: Proceso de aprobación/rechazo
- **Repository Pattern**: Acceso a datos
- **Audit Pattern**: Tracking de aprobador/rechazador
