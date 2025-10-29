# Diagrama de Secuencia - Módulo de Habitaciones

## 1. Crear Habitación

```mermaid
---
title: Crear Habitación
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RoomsController
    participant Service as RoomsService
    participant RoomRepo as RoomRepository

    Admin->>+Controller: POST /rooms (createRoomDto)
    Controller->>+Service: create(data)
    
    Service->>Service: setDefaultValues(isAvailable: true, status: AVAILABLE)
    
    Service->>+RoomRepo: save(roomData)
    RoomRepo-->>-Service: Room
    
    Service-->>-Controller: Room
    Controller-->>-Admin: 201 - Room created
```

## 2. Actualizar Estado de Habitación

```mermaid
---
title: Actualizar Estado de Habitación
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as RoomsController
    participant Service as RoomsService
    participant RoomRepo as RoomRepository

    Personal->>+Controller: PATCH /rooms/:id (updateRoomDto)
    Controller->>+Service: update(id, data)
    
    Service->>+RoomRepo: findOne({where: {id}})
    RoomRepo-->>-Service: Room | null
    
    alt Habitación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Personal: 404 - Room not found
    else Habitación encontrada
        Service->>+RoomRepo: update(id, data)
        RoomRepo-->>-Service: UpdateResult
        
        Service->>+RoomRepo: findOne({where: {id}})
        RoomRepo-->>-Service: Room
        
        Service-->>-Controller: Room
        Controller-->>-Personal: 200 - Room updated
    end
```

## 3. Consultar Habitaciones Disponibles

```mermaid
---
title: Consultar Habitaciones Disponibles
---
sequenceDiagram
    autonumber
    actor Recepcionista
    participant Controller as RoomsController
    participant Service as RoomsService
    participant RoomRepo as RoomRepository

    Recepcionista->>+Controller: GET /rooms/available
    Controller->>+Service: findAvailableRooms()
    
    Service->>+RoomRepo: find({where: {isAvailable: true}, order: {number: ASC}})
    RoomRepo-->>-Service: Room[]
    
    Service-->>-Controller: Room[]
    Controller-->>-Recepcionista: 200 - Available rooms
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Service Layer**: Lógica de negocio
- **State Pattern**: Estados de habitación
