import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestRequest } from '../../entities/guest-request.entity';
import { RequestType } from '../../enums/request-type.enum';
import { RequestStatus } from '../../enums/request-status.enum';
import { RequestPriority } from '../../enums/request-priority.enum';

@Injectable()
export class GuestRequestsSeeder {
  constructor(
    @InjectRepository(GuestRequest)
    private guestRequestRepository: Repository<GuestRequest>,
  ) {}

  async seed() {
    const requests = [
      {
        room: '301',
        guestName: 'Sarah Johnson',
        type: RequestType.TOWELS,
        description:
          'Por favor proporcionar toallas de baño adicionales y toallas de piscina para familia de 4',
        status: RequestStatus.COMPLETED,
        priority: RequestPriority.LOW,
        time: new Date('2024-12-08 14:30:00'),
        completedAt: new Date('2024-12-08 15:15:00'),
        assignedTo: 'María García',
        notes:
          'Entregadas 6 toallas de baño y 4 toallas de piscina según solicitado',
      },
      {
        room: '507',
        guestName: 'Michael Chen',
        type: RequestType.ROOM_SERVICE,
        description:
          'Ordenar cena para 2: Salmón a la parrilla, ensalada César y una botella de Chardonnay',
        status: RequestStatus.IN_PROGRESS,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 18:45:00'),
        assignedTo: 'Personal del Restaurante',
        notes: 'Orden confirmada, tiempo estimado de entrega 19:30',
      },
      {
        room: '203',
        guestName: 'Emily Rodríguez',
        type: RequestType.MAINTENANCE,
        description:
          'Aire acondicionado no funciona correctamente, temperatura de la habitación muy caliente',
        status: RequestStatus.PENDING,
        priority: RequestPriority.HIGH,
        time: new Date('2024-12-08 19:20:00'),
        assignedTo: 'Equipo de Mantenimiento',
        notes: 'Técnico enviado, debe llegar en 30 minutos',
      },
      {
        room: '1205',
        guestName: 'Robert Wilson',
        type: RequestType.HOUSEKEEPING,
        description:
          'Solicitar servicio de limpieza temprano a las 8 AM para preparación de reunión de negocios',
        status: RequestStatus.PENDING,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 20:15:00'),
        assignedTo: 'Supervisor de Limpieza',
        notes: 'Programado para mañana 8:00 AM, servicio nivel VIP',
      },
      {
        room: '802',
        guestName: 'Lisa Thompson',
        type: RequestType.CONCIERGE,
        description:
          'Necesito asistencia reservando entradas para obra de teatro local y recomendaciones de restaurantes',
        status: RequestStatus.COMPLETED,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 16:00:00'),
        completedAt: new Date('2024-12-08 17:30:00'),
        assignedTo: 'James Miller - Conserjería',
        notes:
          'Entradas reservadas para "Romeo y Julieta" y reservación hecha en Le Bernardin',
      },
      {
        room: '404',
        guestName: 'David Kim',
        type: RequestType.TECHNICAL_SUPPORT,
        description:
          'Problemas de conexión Wi-Fi, no puedo conectar laptop para videoconferencia',
        status: RequestStatus.COMPLETED,
        priority: RequestPriority.URGENT,
        time: new Date('2024-12-08 10:30:00'),
        completedAt: new Date('2024-12-08 11:00:00'),
        assignedTo: 'Soporte IT',
        notes:
          'Router reiniciado y proporcionado código de acceso Wi-Fi premium al huésped',
      },
      {
        room: '609',
        guestName: 'Amanda Davis',
        type: RequestType.OTHER,
        description:
          'Solicitud de cuna y artículos para bebé para niño de 18 meses',
        status: RequestStatus.COMPLETED,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 13:45:00'),
        completedAt: new Date('2024-12-08 14:30:00'),
        assignedTo: 'Personal de Conserjería',
        notes:
          'Cuna entregada, mantas para bebé, calentador de biberones y canasta de bienvenida para bebé',
      },
      {
        room: '1101',
        guestName: 'Thomas Anderson',
        type: RequestType.CONCIERGE,
        description:
          'Servicio de transporte al aeropuerto necesario para vuelo temprano a las 6 AM',
        status: RequestStatus.PENDING,
        priority: RequestPriority.HIGH,
        time: new Date('2024-12-08 21:00:00'),
        assignedTo: 'Coordinador de Transporte',
        notes:
          'Sedán de lujo reservado para recogida a las 4:30 AM, conductor confirmado',
      },
      {
        room: '715',
        guestName: 'Jennifer Martínez',
        type: RequestType.HOUSEKEEPING,
        description:
          'Alérgico a almohadas de pluma, necesito alternativas de ropa de cama hipoalergénica',
        status: RequestStatus.COMPLETED,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 12:15:00'),
        completedAt: new Date('2024-12-08 13:00:00'),
        assignedTo: 'Supervisor de Limpieza',
        notes:
          'Reemplazada toda la ropa de cama con alternativas hipoalergénicas, satisfacción del huésped confirmada',
      },
      {
        room: '318',
        guestName: 'Christopher Lee',
        type: RequestType.MAINTENANCE,
        description: 'Ducha del baño tiene baja presión de agua',
        status: RequestStatus.IN_PROGRESS,
        priority: RequestPriority.MEDIUM,
        time: new Date('2024-12-08 17:45:00'),
        assignedTo: 'Especialista en Plomería',
        notes:
          'Investigando el problema, puede necesitar acceso a habitaciones adyacentes para diagnóstico completo',
      },
    ];

    for (const requestData of requests) {
      const existing = await this.guestRequestRepository.findOne({
        where: {
          room: requestData.room,
          guestName: requestData.guestName,
          type: requestData.type,
        },
      });

      if (!existing) {
        await this.guestRequestRepository.save(requestData);
      }
    }

    console.log('✅ Solicitudes de huéspedes pobladas');
  }
}
