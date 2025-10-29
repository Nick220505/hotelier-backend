# Diagrama de Secuencia - Módulo de Notificaciones

## 1. Crear Notificación del Sistema

```mermaid
---
title: Crear Notificación del Sistema
---
sequenceDiagram
    autonumber
    actor Sistema
    participant Service as NotificationsService
    participant NotificationRepo as NotificationRepository

    Sistema->>+Service: createSystemAlert(title, message, refId, refType)
    
    Service->>Service: buildNotificationData(title, message, type: SYSTEM, refId, refType)
    
    Service->>+NotificationRepo: save({...notificationData, isRead: false, createdAt: now})
    NotificationRepo-->>-Service: Notification
    
    Service-->>-Sistema: Notification
```

## 2. Obtener Notificaciones de Usuario

```mermaid
---
title: Obtener Notificaciones de Usuario
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as NotificationsController
    participant Service as NotificationsService
    participant NotificationRepo as NotificationRepository

    Usuario->>+Controller: GET /notifications/user/:userId
    Controller->>+Service: getUserNotifications(userId)
    
    Service->>+NotificationRepo: find({where: {userId}, order: {createdAt: DESC}})
    NotificationRepo-->>-Service: Notification[]
    
    Service-->>-Controller: Notification[]
    Controller-->>-Usuario: 200 - User notifications
```

## 3. Marcar Notificación como Leída

```mermaid
---
title: Marcar Notificación como Leída
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as NotificationsController
    participant Service as NotificationsService
    participant NotificationRepo as NotificationRepository

    Usuario->>+Controller: PUT /notifications/:id/read
    Controller->>+Service: markAsRead(id)
    
    Service->>+NotificationRepo: findOne({where: {id}})
    NotificationRepo-->>-Service: Notification | null
    
    alt Notificación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - Notification not found
    else Notificación encontrada
        Service->>+NotificationRepo: update(id, {isRead: true, readAt: now})
        NotificationRepo-->>-Service: UpdateResult
        
        Service->>+NotificationRepo: findOne({where: {id}})
        NotificationRepo-->>-Service: Notification
        
        Service-->>-Controller: Notification
        Controller-->>-Usuario: 200 - Notification marked as read
    end
```

## 4. Obtener Notificaciones No Leídas

```mermaid
---
title: Obtener Notificaciones No Leídas
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as NotificationsController
    participant Service as NotificationsService
    participant NotificationRepo as NotificationRepository

    Usuario->>+Controller: GET /notifications/user/:userId/unread
    Controller->>+Service: getUnreadNotifications(userId)
    
    Service->>+NotificationRepo: find({where: {userId, isRead: false}, order: {createdAt: DESC}})
    NotificationRepo-->>-Service: Notification[]
    
    Service-->>-Controller: Notification[]
    Controller-->>-Usuario: 200 - Unread notifications
```

## 5. Eliminar Notificación

```mermaid
---
title: Eliminar Notificación
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as NotificationsController
    participant Service as NotificationsService
    participant NotificationRepo as NotificationRepository

    Usuario->>+Controller: DELETE /notifications/:id
    Controller->>+Service: remove(id)
    
    Service->>+NotificationRepo: findOne({where: {id}})
    NotificationRepo-->>-Service: Notification | null
    
    alt Notificación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - Notification not found
    else Notificación encontrada
        Service->>+NotificationRepo: remove(notification)
        NotificationRepo-->>-Service: Notification
        
        Service-->>-Controller: Notification
        Controller-->>-Usuario: 200 - Notification deleted
    end
```

## Patrones Implementados

- **Observer Pattern**: Sistema de notificaciones
- **Repository Pattern**: Acceso a datos
- **Event-Driven Pattern**: Notificaciones basadas en eventos
- **Read Tracking Pattern**: Marcado de lecturas
