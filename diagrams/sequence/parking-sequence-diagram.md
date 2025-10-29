# Diagrama de Secuencia - Módulo de Estacionamiento

## 1. Registrar Vehículo

```mermaid
---
title: Registrar Vehículo
---
sequenceDiagram
    autonumber
    actor Valet
    participant Controller as ParkingController
    participant Service as ParkingService
    participant ParkingRepo as ParkingSpotRepository

    Valet->>+Controller: POST /parking/spots (createParkingSpotDto)
    Controller->>+Service: createParkingSpot(data)
    
    Service->>Service: setDefaultValues(status: OCCUPIED, checkInTime: now)
    
    Service->>+ParkingRepo: save(parkingSpotData)
    ParkingRepo-->>-Service: ParkingSpot
    
    Service-->>-Controller: ParkingSpot
    Controller-->>-Valet: 201 - Vehicle registered
```

## 2. Liberar Espacio de Estacionamiento

```mermaid
---
title: Liberar Espacio de Estacionamiento
---
sequenceDiagram
    autonumber
    actor Valet
    participant Controller as ParkingController
    participant Service as ParkingService
    participant ParkingRepo as ParkingSpotRepository

    Valet->>+Controller: POST /parking/spots/:id/release
    Controller->>+Service: releaseParkingSpot(id)
    
    Service->>+ParkingRepo: findOne({where: {id}})
    ParkingRepo-->>-Service: ParkingSpot | null
    
    alt Espacio no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Valet: 404 - Parking spot not found
    else Espacio encontrado
        Service->>+ParkingRepo: update(id, {status: AVAILABLE, checkOutTime: now, vehicleInfo: null})
        ParkingRepo-->>-Service: UpdateResult
        
        Service->>+ParkingRepo: findOne({where: {id}})
        ParkingRepo-->>-Service: ParkingSpot
        
        Service-->>-Controller: ParkingSpot
        Controller-->>-Valet: 200 - Parking spot released
    end
```

## 3. Consultar Espacios Disponibles

```mermaid
---
title: Consultar Espacios Disponibles
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as ParkingController
    participant Service as ParkingService
    participant ParkingRepo as ParkingSpotRepository

    Usuario->>+Controller: GET /parking/spots/available
    Controller->>+Service: getAvailableParkingSpots()
    
    Service->>+ParkingRepo: find({where: {status: AVAILABLE}, order: {spotNumber: ASC}})
    ParkingRepo-->>-Service: ParkingSpot[]
    
    Service-->>-Controller: ParkingSpot[]
    Controller-->>-Usuario: 200 - Available parking spots
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **State Pattern**: Estados de espacios (AVAILABLE, OCCUPIED, RESERVED)
- **Timestamp Pattern**: Registro de check-in/check-out
