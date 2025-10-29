# Diagrama de Secuencia - Módulo de Mantenimiento

## 1. Crear Solicitud de Mantenimiento

```mermaid
---
title: Crear Solicitud de Mantenimiento
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as MaintenanceController
    participant Service as MaintenanceService
    participant RequestRepo as MaintenanceRequestRepository
    participant Notifications as NotificationsService

    Personal->>+Controller: POST /maintenance/requests (createRequestDto)
    Controller->>+Service: createRequest(data)
    
    Service->>Service: generateRequestNumber()
    Service->>Service: setDefaultValues(status: PENDING, priority, reportedDate: now)
    
    Service->>+RequestRepo: save(requestData)
    RequestRepo-->>-Service: MaintenanceRequest
    
    Service->>+Notifications: createSystemAlert(title, message, refId, refType)
    Notifications-->>-Service: Notification
    
    Service-->>-Controller: MaintenanceRequest
    Controller-->>-Personal: 201 - Maintenance request created
```

## 2. Asignar Técnico

```mermaid
---
title: Asignar Técnico
---
sequenceDiagram
    autonumber
    actor Supervisor
    participant Controller as MaintenanceController
    participant Service as MaintenanceService
    participant RequestRepo as MaintenanceRequestRepository

    Supervisor->>+Controller: PUT /maintenance/requests/:id/assign (technicianId)
    Controller->>+Service: assignTechnician(id, technicianId)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: MaintenanceRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Supervisor: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {technicianId, status: IN_PROGRESS, assignedDate: now})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: MaintenanceRequest
        
        Service-->>-Controller: MaintenanceRequest
        Controller-->>-Supervisor: 200 - Technician assigned
    end
```

## 3. Completar Mantenimiento

```mermaid
---
title: Completar Mantenimiento
---
sequenceDiagram
    autonumber
    actor Técnico
    participant Controller as MaintenanceController
    participant Service as MaintenanceService
    participant RequestRepo as MaintenanceRequestRepository

    Técnico->>+Controller: PUT /maintenance/requests/:id/complete (completionNotes, cost)
    Controller->>+Service: completeRequest(id, completionNotes, cost)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: MaintenanceRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Técnico: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {status: COMPLETED, completedDate: now, completionNotes, cost})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: MaintenanceRequest
        
        Service-->>-Controller: MaintenanceRequest
        Controller-->>-Técnico: 200 - Maintenance completed
    end
```

## 4. Obtener Solicitudes Pendientes

```mermaid
---
title: Obtener Solicitudes Pendientes
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as MaintenanceController
    participant Service as MaintenanceService
    participant RequestRepo as MaintenanceRequestRepository

    Gerente->>+Controller: GET /maintenance/requests/pending
    Controller->>+Service: getPendingRequests()
    
    Service->>+RequestRepo: find({where: {status: PENDING}, order: {priority: DESC, reportedDate: ASC}})
    RequestRepo-->>-Service: MaintenanceRequest[]
    
    Service-->>-Controller: MaintenanceRequest[]
    Controller-->>-Gerente: 200 - Pending maintenance requests
```

## Patrones Implementados

- **State Pattern**: Estados de mantenimiento (PENDING, IN_PROGRESS, COMPLETED)
- **Observer Pattern**: Notificaciones automáticas
- **Priority Pattern**: Ordenamiento por prioridad
- **Repository Pattern**: Acceso a datos
