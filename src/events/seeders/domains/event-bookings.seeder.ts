import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventBooking } from '../../entities/event-booking.entity';
import { Venue } from '../../../venues/entities/venue.entity';
import { EventStatus } from '../../enums/event-status.enum';

@Injectable()
export class EventBookingsSeeder {
  constructor(
    @InjectRepository(EventBooking)
    private eventBookingRepository: Repository<EventBooking>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async seed() {
    const venues = await this.venueRepository.find();

    if (venues.length === 0) {
      console.log('Skipping event booking seeds - no venues found');
      return;
    }

    const eventBookings = [
      {
        title: 'Reunión Familiar Martínez',
        description:
          'Encuentro familiar anual con almuerzo, actividades y celebración para toda la familia extendida.',
        eventDate: new Date('2024-12-14'),
        startTime: '11:00',
        endTime: '16:00',
        attendees: 80,
        totalCost: 10080000.0,
        status: EventStatus.CONFIRMED,
        clientName: 'Carlos Martínez',
        clientEmail: 'carlos.martinez@gmail.com',
        clientPhone: '+57 310 123 4567',
        notes:
          'La familia tiene restricciones alimenticias - requieren opciones vegetarianas',
        venueId:
          venues.find((v) => v.name === 'Pabellón del Jardín')?.id ||
          venues[0].id,
      },
      {
        title: 'Presentación para Inversionistas TechCol',
        description:
          'Presentación de propuesta de negocio a inversionistas potenciales con sesión de preguntas y networking.',
        eventDate: new Date('2024-12-20'),
        startTime: '13:00',
        endTime: '17:00',
        attendees: 35,
        totalCost: 4410000.0,
        status: EventStatus.PLANNED,
        clientName: 'Sandra Jiménez',
        clientEmail: 'sandra.jimenez@techcol.com.co',
        clientPhone: '+57 320 456 7890',
        notes:
          'Necesitan configuración de transmisión en vivo y equipo de grabación',
        venueId:
          venues.find((v) => v.name === 'Sala de Conferencias Alpha')?.id ||
          venues[0].id,
      },
      {
        title: 'Celebración de Bodas de Oro',
        description:
          'Celebración del 50° aniversario de bodas con cena y baile para familiares y amigos.',
        eventDate: new Date('2024-12-25'),
        startTime: '17:00',
        endTime: '22:00',
        attendees: 120,
        totalCost: 25200000.0,
        status: EventStatus.CONFIRMED,
        clientName: 'Roberto y Linda Vargas',
        clientEmail: 'rvargas@hotmail.com',
        clientPhone: '+57 315 789 0123',
        notes: 'Torta de aniversario y decoración especial requerida',
        venueId:
          venues.find((v) => v.name === 'Salón Principal')?.id || venues[0].id,
      },
      {
        title: 'Reunión Trimestral de Ventas',
        description:
          'Reunión del equipo regional de ventas con revisión de desempeño y sesión de planificación.',
        eventDate: new Date('2024-12-18'),
        startTime: '09:00',
        endTime: '15:00',
        attendees: 15,
        totalCost: 5040000.0,
        status: EventStatus.IN_PROGRESS,
        clientName: 'Miguel Ángel Castro',
        clientEmail: 'mcastro@ventascolombia.com',
        clientPhone: '+57 301 234 5678',
        notes:
          'Almuerzo incluido en catering, necesitan rotafolios y marcadores',
        venueId:
          venues.find((v) => v.name === 'Sala Ejecutiva')?.id || venues[0].id,
      },
    ];

    for (const bookingData of eventBookings) {
      const existing = await this.eventBookingRepository.findOne({
        where: {
          title: bookingData.title,
          clientEmail: bookingData.clientEmail,
        },
      });

      if (!existing) {
        await this.eventBookingRepository.save(bookingData);
      }
    }
  }
}
