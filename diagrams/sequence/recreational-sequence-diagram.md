# Diagrama de Secuencia - Módulo Recreativo

## 1. Crear Instalación Recreativa

```mermaid
---
title: Crear Instalación Recreativa
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RecreationalController
    participant Service as RecreationalService
    participant FacilityRepo as RecreationalFacilityRepository

    Admin->>+Controller: POST /recreational/facilities (createFacilityDto)
    Controller->>+Service: createFacility(data)
    
    Service->>Service: setDefaultValues(isAvailable: true, status: OPERATIONAL)
    
    Service->>+FacilityRepo: save(facilityData)
    FacilityRepo-->>-Service: RecreationalFacility
    
    Service-->>-Controller: RecreationalFacility
    Controller-->>-Admin: 201 - Facility created
```

## 2. Reservar Instalación

```mermaid
---
title: Reservar Instalación
---
sequenceDiagram
    autonumber
    actor Huésped
    participant Controller as RecreationalController
    participant Service as RecreationalService
    participant FacilityRepo as RecreationalFacilityRepository
    participant BookingRepo as FacilityBookingRepository

    Huésped->>+Controller: POST /recreational/facilities/:id/book (bookingData)
    Controller->>+Service: bookFacility(facilityId, bookingData)
    
    Service->>+FacilityRepo: findOne({where: {id: facilityId}})
    FacilityRepo-->>-Service: RecreationalFacility | null
    
    alt Instalación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Huésped: 404 - Facility not found
    else Instalación no disponible
        Service-->>Controller: BadRequestException
        Controller-->>Huésped: 400 - Facility not available
    else Disponible
        Service->>+BookingRepo: save({facilityId, ...bookingData, status: CONFIRMED})
        BookingRepo-->>-Service: FacilityBooking
        
        Service-->>-Controller: FacilityBooking
        Controller-->>-Huésped: 201 - Facility booked
    end
```

## 3. Consultar Instalaciones Disponibles

```mermaid
---
title: Consultar Instalaciones Disponibles
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as RecreationalController
    participant Service as RecreationalService
    participant FacilityRepo as RecreationalFacilityRepository

    Usuario->>+Controller: GET /recreational/facilities/available
    Controller->>+Service: getAvailableFacilities()
    
    Service->>+FacilityRepo: find({where: {isAvailable: true, status: OPERATIONAL}, order: {name: ASC}})
    FacilityRepo-->>-Service: RecreationalFacility[]
    
    Service-->>-Controller: RecreationalFacility[]
    Controller-->>-Usuario: 200 - Available facilities
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Booking Pattern**: Sistema de reservas
- **State Pattern**: Estados de instalaciones
