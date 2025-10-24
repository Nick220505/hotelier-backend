# Diagrama de Clases - Módulo de Habitaciones

```mermaid
classDiagram
    %% Controllers
    class RoomsController {
        -RoomsService roomsService
        +create(createRoomDto) Promise~Room~
        +findAll() Promise~Room[]~
        +findOne(id) Promise~Room~
        +update(id, updateRoomDto) Promise~Room~
        +delete(id) Promise~Room~
    }

    %% Services
    class RoomsService {
        -Repository~Room~ roomRepository
        +findAll() Promise~Room[]~
        +findOne(id) Promise~Room~
        +create(data) Promise~Room~
        +update(id, data) Promise~Room~
        +delete(id) Promise~Room~
    }

    %% Entities
    class Room {
        +int id
        +string number
        +RoomType type
        +decimal price
        +int capacity
        +boolean isAvailable
        +string description
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateRoomDto {
        +string number
        +RoomType type
        +decimal price
        +int capacity
        +boolean isAvailable
        +string description
    }

    class UpdateRoomDto {
        +string number
        +RoomType type
        +decimal price
        +int capacity
        +boolean isAvailable
        +string description
    }

    %% Enumerations
    class RoomType {
        <<enumeration>>
        SIMPLE
        DOBLE
        SUITE
        PRESIDENCIAL
    }

    %% Relationships
    RoomsController --> RoomsService : uses
    RoomsController ..> CreateRoomDto : uses
    RoomsController ..> UpdateRoomDto : uses
    
    RoomsService --> Room : manages
    RoomsService ..> CreateRoomDto : creates from
    RoomsService ..> UpdateRoomDto : updates from
    
    Room --> RoomType : type
    CreateRoomDto --> RoomType : type
    UpdateRoomDto --> RoomType : type
```

## Descripción

Módulo para gestión de habitaciones del hotel.

### Entities
- **Room**: Habitación con número, tipo, precio, capacidad y disponibilidad

### DTOs
- **CreateRoomDto**: Datos para crear habitación
- **UpdateRoomDto**: Datos para actualizar habitación

### Enumerations
- **RoomType**: Tipos de habitación (SIMPLE, DOBLE, SUITE, PRESIDENCIAL)
