# Diagrama de Clases - Módulo de Configuración

```mermaid
classDiagram
    %% Controllers
    class ConfigurationController {
        -ConfigurationService configurationService
        +getHotelConfig() Promise~HotelConfigDto~
        +updateHotelConfig(updateData) Promise~HotelConfigDto~
    }

    %% Services
    class ConfigurationService {
        -Repository~Configuration~ configRepository
        -getValue(category, key) Promise~string~
        -setValue(category, key, value, description) Promise~void~
        +create(data) Promise~Configuration~
        +findAll() Promise~Configuration[]~
        +findOne(id) Promise~Configuration~
        +findByKey(key) Promise~Configuration~
        +findByCategory(category) Promise~Configuration[]~
        +updateByKey(key, value) Promise~Configuration~
        +update(id, data) Promise~Configuration~
        +remove(id) Promise~Configuration~
        +getHotelSettings() Promise~Record~
        +getSystemSettings() Promise~Record~
        +getPaymentSettings() Promise~Record~
        +getNotificationSettings() Promise~Record~
        +bulkUpdate(updates) Promise~Configuration[]~
        +getHotelConfig() Promise~HotelConfigDto~
        +updateHotelConfig(data) Promise~HotelConfigDto~
    }

    %% Entities
    class Configuration {
        +int id
        +string key
        +string value
        +ConfigCategory category
        +string description
        +boolean isEditable
        +boolean isSecure
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateConfigurationDto {
        +string key
        +string value
        +ConfigCategory category
        +string description
        +boolean isEditable
        +boolean isSecure
    }

    class UpdateConfigurationDto {
        +string key
        +string value
        +ConfigCategory category
        +string description
        +boolean isEditable
        +boolean isSecure
    }

    class HotelConfigDto {
        +int id
        +string propertyName
        +string propertyAddress
        +string propertyPhone
        +string propertyEmail
        +string checkInTime
        +string checkOutTime
        +string cancellationPolicy
        +string timeZone
    }

    class UpdateHotelConfigDto {
        +string name
        +string description
        +string address
        +string phone
        +string email
        +string website
        +string checkInTime
        +string checkOutTime
        +string language
        +string timezone
        +string taxRate
    }

    %% Enumerations
    class ConfigCategory {
        <<enumeration>>
        GENERAL
        HOTEL
        SYSTEM
        SECURITY
        PAYMENT
        NOTIFICATION
        INTEGRATION
        APPEARANCE
    }

    %% Relationships
    ConfigurationController --> ConfigurationService : uses
    ConfigurationController ..> HotelConfigDto : returns
    ConfigurationController ..> UpdateHotelConfigDto : receives
    
    ConfigurationService --> Configuration : manages
    ConfigurationService ..> CreateConfigurationDto : creates from
    ConfigurationService ..> UpdateConfigurationDto : updates from
    ConfigurationService ..> HotelConfigDto : builds
    ConfigurationService ..> UpdateHotelConfigDto : processes
    
    Configuration --> ConfigCategory : categorized by
    
    CreateConfigurationDto --> ConfigCategory : category
    UpdateConfigurationDto --> ConfigCategory : category
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de configuración:

### Controllers
- **ConfigurationController**: Maneja las peticiones HTTP para configuración del hotel

### Services
- **ConfigurationService**: Lógica de negocio para gestión de configuraciones
  - Operaciones CRUD genéricas
  - Métodos especializados por categoría
  - Gestión específica de configuración hotelera
  - Actualización masiva de configuraciones

### Entities
- **Configuration**: Configuración key-value del sistema
  - Clave única y valor
  - Categorización por tipo
  - Flags de editabilidad y seguridad
  - Descripción para documentación

### DTOs
- **CreateConfigurationDto**: Datos para crear una configuración
- **UpdateConfigurationDto**: Datos para actualizar una configuración
- **HotelConfigDto**: Configuración específica del hotel (respuesta)
- **UpdateHotelConfigDto**: Actualización de configuración del hotel

### Enumerations
- **ConfigCategory**: Categorías de configuración
  - GENERAL: Configuraciones generales
  - HOTEL: Información y políticas del hotel
  - SYSTEM: Configuraciones del sistema
  - SECURITY: Configuraciones de seguridad
  - PAYMENT: Configuraciones de pagos
  - NOTIFICATION: Configuraciones de notificaciones
  - INTEGRATION: Configuraciones de integraciones
  - APPEARANCE: Configuraciones de apariencia

### Funcionalidades Principales
- Gestión centralizada de configuraciones del sistema
- Configuraciones agrupadas por categoría
- Configuraciones editables vs. solo lectura
- Configuraciones seguras (sensibles)
- API específica para configuración del hotel
- Actualización masiva de múltiples configuraciones
- Consultas por categoría para diferentes áreas del sistema
