# Diagrama de Secuencia - Módulo de Venues (Salones)

## 1. Crear Salón

```mermaid
---
title: Crear Salón
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as VenuesController
    participant Service as VenuesService
    participant VenueRepo as VenueRepository

    Admin->>+Controller: POST /venues (createVenueDto)
    Controller->>+Service: create(data)
    
    Service->>Service: setDefaultValues(isAvailable: true)
    
    Service->>+VenueRepo: save(venueData)
    VenueRepo-->>-Service: Venue
    
    Service-->>-Controller: Venue
    Controller-->>-Admin: 201 - Venue created
```

## 2. Reservar Salón

```mermaid
---
title: Reservar Salón
---
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as VenuesController
    participant Service as VenuesService
    participant VenueRepo as VenueRepository
    participant ReservationRepo as VenueReservationRepository

    Cliente->>+Controller: POST /venues/:id/reserve (reservationData)
    Controller->>+Service: reserveVenue(venueId, reservationData)
    
    Service->>+VenueRepo: findOne({where: {id: venueId}})
    VenueRepo-->>-Service: Venue | null
    
    alt Salón no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Cliente: 404 - Venue not found
    else Salón no disponible
        Service-->>Controller: BadRequestException
        Controller-->>Cliente: 400 - Venue not available
    else Disponible
        Service->>+ReservationRepo: save({venueId, ...reservationData, status: CONFIRMED})
        ReservationRepo-->>-Service: VenueReservation
        
        Service->>+VenueRepo: update(venueId, {isAvailable: false})
        VenueRepo-->>-Service: UpdateResult
        
        Service-->>-Controller: VenueReservation
        Controller-->>-Cliente: 201 - Venue reserved
    end
```

## 3. Consultar Salones Disponibles

```mermaid
---
title: Consultar Salones Disponibles
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as VenuesController
    participant Service as VenuesService
    participant VenueRepo as VenueRepository

    Usuario->>+Controller: GET /venues/available
    Controller->>+Service: findAvailableVenues()
    
    Service->>+VenueRepo: find({where: {isAvailable: true}, order: {name: ASC}})
    VenueRepo-->>-Service: Venue[]
    
    Service-->>-Controller: Venue[]
    Controller-->>-Usuario: 200 - Available venues
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Reservation Pattern**: Sistema de reservas
- **State Pattern**: Estados de disponibilidad
