# Diagrama de Secuencia - Módulo de Configuración

## 1. Obtener Configuración del Hotel

```mermaid
---
title: Obtener Configuración del Hotel
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as ConfigurationController
    participant Service as ConfigurationService
    participant ConfigRepo as ConfigurationRepository

    Admin->>+Controller: GET /configuration/hotel
    Controller->>+Service: getHotelConfig()
    
    Service->>+Service: getValue(HOTEL, 'PROPERTY_NAME')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'PROPERTY_NAME'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | null
    
    Service->>+Service: getValue(HOTEL, 'PROPERTY_ADDRESS')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'PROPERTY_ADDRESS'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | null
    
    Service->>+Service: getValue(HOTEL, 'PROPERTY_PHONE')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'PROPERTY_PHONE'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | null
    
    Service->>+Service: getValue(HOTEL, 'PROPERTY_EMAIL')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'PROPERTY_EMAIL'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | null
    
    Service->>+Service: getValue(HOTEL, 'CHECKIN_TIME')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'CHECKIN_TIME'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | '15:00'
    
    Service->>+Service: getValue(HOTEL, 'CHECKOUT_TIME')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'CHECKOUT_TIME'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | '11:00'
    
    Service->>+Service: getValue(HOTEL, 'CANCELLATION_POLICY')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'CANCELLATION_POLICY'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | ''
    
    Service->>+Service: getValue(HOTEL, 'TIMEZONE')
    Service->>+ConfigRepo: findOne({where: {category: HOTEL, key: 'TIMEZONE'}})
    ConfigRepo-->>-Service: Configuration | null
    Service-->>-Service: value | 'UTC'
    
    Service->>Service: buildHotelConfigDto(values)
    
    Service-->>-Controller: HotelConfigDto
    Controller-->>-Admin: 200 - Hotel configuration
```

## 2. Actualizar Configuración del Hotel

```mermaid
---
title: Actualizar Configuración del Hotel
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as ConfigurationController
    participant Service as ConfigurationService
    participant ConfigRepo as ConfigurationRepository

    Admin->>+Controller: PUT /configuration/hotel (updateHotelConfigDto)
    Controller->>+Service: updateHotelConfig(data)
    
    loop Para cada campo en data
        alt Campo está definido
            Service->>+Service: setValue(HOTEL, key, value, description)
            Service->>+ConfigRepo: findOne({where: {category: HOTEL, key}})
            ConfigRepo-->>-Service: Configuration | null
            
            alt Configuración existe
                alt Valor o descripción cambió
                    Service->>+ConfigRepo: update(id, {value, description})
                    ConfigRepo-->>-Service: UpdateResult
                end
            else Configuración no existe
                Service->>+ConfigRepo: save({category: HOTEL, key, value, description, isEditable: true})
                ConfigRepo-->>-Service: Configuration
            end
            Service-->>-Service: void
        end
    end
    
    Service->>+Service: getHotelConfig()
    Note over Service: Obtiene configuración actualizada
    Service-->>-Service: HotelConfigDto
    
    Service-->>-Controller: HotelConfigDto
    Controller-->>-Admin: 200 - Hotel configuration updated
```

## Descripción de Flujos

### 1. Obtener Configuración del Hotel

- Recupera todas las configuraciones específicas del hotel
- Campos incluidos:
  - Nombre de la propiedad
  - Dirección
  - Teléfono
  - Email
  - Hora de check-in (default: 15:00)
  - Hora de check-out (default: 11:00)
  - Política de cancelación
  - Zona horaria (default: UTC)
- Retorna objeto consolidado HotelConfigDto

### 2. Actualizar Configuración del Hotel

- Actualiza configuraciones del hotel de forma individual
- Para cada campo en el DTO:
  - Busca configuración existente por categoría y clave
  - Si existe y cambió: actualiza valor/descripción
  - Si no existe: crea nueva configuración
- Retorna configuración completa actualizada
- Campos editables marcados como isEditable: true

## Patrones Implementados

- **Repository Pattern**: Acceso a datos a través de repositorios
- **DTO Pattern**: Transferencia de datos con HotelConfigDto
- **Key-Value Store Pattern**: Almacenamiento flexible de configuraciones
- **Category Pattern**: Agrupación de configuraciones por categoría (HOTEL, SYSTEM, PAYMENT, NOTIFICATION)
- **Upsert Pattern**: Crea o actualiza según existencia
