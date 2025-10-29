# Diagrama de Secuencia - Módulo de Solicitudes de Huéspedes

## 1. Crear Solicitud de Huésped

```mermaid
---
title: Crear Solicitud de Huésped
---
sequenceDiagram
    autonumber
    actor Huésped
    participant Controller as GuestRequestsController
    participant Service as GuestRequestsService
    participant RequestRepo as GuestRequestRepository
    participant Notifications as NotificationsService

    Huésped->>+Controller: POST /guest-requests (createRequestDto)
    Controller->>+Service: create(data)
    
    Service->>Service: setDefaultValues(status: PENDING, requestDate: now)
    
    Service->>+RequestRepo: save(requestData)
    RequestRepo-->>-Service: GuestRequest
    
    Service->>+Notifications: createSystemAlert(title, message, refId, refType)
    Notifications-->>-Service: Notification
    
    Service-->>-Controller: GuestRequest
    Controller-->>-Huésped: 201 - Request created
```

## 2. Atender Solicitud

```mermaid
---
title: Atender Solicitud
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as GuestRequestsController
    participant Service as GuestRequestsService
    participant RequestRepo as GuestRequestRepository

    Personal->>+Controller: PUT /guest-requests/:id/attend (attendedBy)
    Controller->>+Service: attendRequest(id, attendedBy)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: GuestRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Personal: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {status: IN_PROGRESS, attendedBy, attendedAt: now})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: GuestRequest
        
        Service-->>-Controller: GuestRequest
        Controller-->>-Personal: 200 - Request being attended
    end
```

## 3. Completar Solicitud

```mermaid
---
title: Completar Solicitud
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as GuestRequestsController
    participant Service as GuestRequestsService
    participant RequestRepo as GuestRequestRepository

    Personal->>+Controller: PUT /guest-requests/:id/complete (resolutionNotes)
    Controller->>+Service: completeRequest(id, resolutionNotes)
    
    Service->>+RequestRepo: findOne({where: {id}})
    RequestRepo-->>-Service: GuestRequest | null
    
    alt Solicitud no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Personal: 404 - Request not found
    else Solicitud encontrada
        Service->>+RequestRepo: update(id, {status: COMPLETED, completedAt: now, resolutionNotes})
        RequestRepo-->>-Service: UpdateResult
        
        Service->>+RequestRepo: findOne({where: {id}})
        RequestRepo-->>-Service: GuestRequest
        
        Service-->>-Controller: GuestRequest
        Controller-->>-Personal: 200 - Request completed
    end
```

## 4. Listar Solicitudes Pendientes

```mermaid
---
title: Listar Solicitudes Pendientes
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as GuestRequestsController
    participant Service as GuestRequestsService
    participant RequestRepo as GuestRequestRepository

    Personal->>+Controller: GET /guest-requests/pending
    Controller->>+Service: findPendingRequests()
    
    Service->>+RequestRepo: find({where: {status: PENDING}, order: {requestDate: ASC}})
    RequestRepo-->>-Service: GuestRequest[]
    
    Service-->>-Controller: GuestRequest[]
    Controller-->>-Personal: 200 - Pending guest requests
```

## Patrones Implementados

- **State Pattern**: Estados de solicitud (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- **Observer Pattern**: Notificaciones automáticas
- **Repository Pattern**: Acceso a datos
- **Timestamp Pattern**: Tracking de tiempos de atención
