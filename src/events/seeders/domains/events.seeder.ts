import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/event.entity';
import { EventStatus } from '../../enums/event-status.enum';

@Injectable()
export class EventsSeeder {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async seed() {
    const events = [
      {
        title: 'Retiro Empresarial Anual',
        description:
          'Retiro corporativo enfocado en trabajo en equipo y planificación estratégica para el próximo año.',
        eventDate: new Date('2024-12-15'),
        startTime: '09:00',
        endTime: '17:00',
        venue: 'Sala de Conferencias Alpha',
        capacity: 50,
        attendees: 45,
        status: EventStatus.CONFIRMED,
        organizer: 'Tecnología Avanzada S.A.S.',
        cost: 1200.0,
        revenue: 2500.0,
      },
      {
        title: 'Matrimonio Martínez-García',
        description:
          'Celebración de matrimonio con ceremonia, cena, baile y fiesta para 150 invitados.',
        eventDate: new Date('2024-12-22'),
        startTime: '18:00',
        endTime: '23:00',
        venue: 'Salón Principal',
        capacity: 200,
        attendees: 150,
        status: EventStatus.CONFIRMED,
        organizer: 'Familia Martínez García',
        cost: 2500.0,
        revenue: 8500.0,
      },
      {
        title: 'Lanzamiento de Producto Innovador',
        description:
          'Presentación exclusiva del nuevo producto con demostraciones, conferencias y cóctel de networking.',
        eventDate: new Date('2024-12-10'),
        startTime: '16:00',
        endTime: '20:00',
        venue: 'Pabellón del Jardín',
        capacity: 120,
        attendees: 85,
        status: EventStatus.COMPLETED,
        organizer: 'Laboratorios de Innovación Ltda.',
        cost: 1800.0,
        revenue: 4200.0,
      },
      {
        title: 'Asamblea de Accionistas',
        description:
          'Reunión trimestral de la junta directiva para revisar rendimiento financiero e iniciativas estratégicas.',
        eventDate: new Date('2024-12-28'),
        startTime: '14:00',
        endTime: '18:00',
        venue: 'Sala Ejecutiva',
        capacity: 20,
        attendees: 18,
        status: EventStatus.PLANNED,
        organizer: 'Grupo Empresarial Colombiano S.A.',
        cost: 800.0,
        revenue: 1600.0,
      },
      {
        title: 'Celebración de Fin de Año',
        description:
          'Gran celebración navideña con cena de gala, espectáculos en vivo y premiación anual.',
        eventDate: new Date('2024-12-31'),
        startTime: '19:00',
        endTime: '01:00',
        venue: 'Salón Principal',
        capacity: 200,
        attendees: 180,
        status: EventStatus.CONFIRMED,
        organizer: 'Administración del Hotel',
        cost: 3000.0,
        revenue: 12000.0,
      },
    ];

    for (const eventData of events) {
      const existing = await this.eventRepository.findOne({
        where: { title: eventData.title, eventDate: eventData.eventDate },
      });

      if (!existing) {
        await this.eventRepository.save(eventData);
      }
    }
  }
}
