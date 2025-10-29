# Diagrama de Secuencia - Módulo de Eventos

## 1. Crear Evento

```mermaid
---
title: Crear Evento
---
sequenceDiagram
    autonumber
    actor Organizador
    participant Controller as EventsController
    participant Service as EventsService
    participant EventRepo as EventRepository

    Organizador->>+Controller: POST /events (createEventDto)
    Controller->>+Service: create(data)
    
    Service->>Service: setDefaultValues(status: PLANNED)
    
    Service->>+EventRepo: save(eventData)
    EventRepo-->>-Service: Event
    
    Service-->>-Controller: Event
    Controller-->>-Organizador: 201 - Event created
```

## 2. Actualizar Estado de Evento

```mermaid
---
title: Actualizar Estado de Evento
---
sequenceDiagram
    autonumber
    actor Organizador
    participant Controller as EventsController
    participant Service as EventsService
    participant EventRepo as EventRepository

    Organizador->>+Controller: PATCH /events/:id (updateEventDto)
    Controller->>+Service: update(id, data)
    
    Service->>+EventRepo: findOne({where: {id}})
    EventRepo-->>-Service: Event | null
    
    alt Evento no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Organizador: 404 - Event not found
    else Evento encontrado
        Service->>+EventRepo: update(id, data)
        EventRepo-->>-Service: UpdateResult
        
        Service->>+EventRepo: findOne({where: {id}})
        EventRepo-->>-Service: Event
        
        Service-->>-Controller: Event
        Controller-->>-Organizador: 200 - Event updated
    end
```

## 3. Listar Eventos por Fecha

```mermaid
---
title: Listar Eventos por Fecha
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as EventsController
    participant Service as EventsService
    participant EventRepo as EventRepository

    Usuario->>+Controller: GET /events/date/:date
    Controller->>+Service: findByDate(date)
    
    Service->>Service: calculateDateRange(date)
    
    Service->>+EventRepo: find({where: {eventDate: Between(start, end)}, order: {eventTime: ASC}})
    EventRepo-->>-Service: Event[]
    
    Service-->>-Controller: Event[]
    Controller-->>-Usuario: 200 - Events for date
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **State Pattern**: Estados de evento (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
- **Date Range Pattern**: Búsquedas por fecha
