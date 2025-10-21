import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../../entities/venue.entity';

@Injectable()
export class VenuesSeeder {
  constructor(
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async seed() {
    const venues = [
      {
        name: 'Salón Principal',
        capacity: 200,
        area: 400.0,
        hourlyRate: 500.0,
        available: true,
        location: 'Edificio Principal - Planta Baja',
        description:
          'Elegante salón perfecto para bodas, eventos corporativos y grandes celebraciones. Cuenta con lámparas de cristal y vistas panorámicas de la ciudad.',
      },
      {
        name: 'Sala de Conferencias Alpha',
        capacity: 50,
        area: 80.0,
        hourlyRate: 150.0,
        available: true,
        location: 'Centro de Negocios - 2do Piso',
        description:
          'Moderna sala de conferencias equipada con la última tecnología para reuniones de negocios y presentaciones.',
      },
      {
        name: 'Pabellón del Jardín',
        capacity: 120,
        area: 200.0,
        hourlyRate: 300.0,
        available: true,
        location: 'Jardines del Hotel - Exterior',
        description:
          'Hermoso pabellón al aire libre rodeado de jardines paisajísticos, ideal para recepciones de cóctel y ceremonias al aire libre.',
      },
      {
        name: 'Sala Ejecutiva',
        capacity: 20,
        area: 40.0,
        hourlyRate: 200.0,
        available: true,
        location: 'Piso Ejecutivo - 15to Piso',
        description:
          'Sala ejecutiva exclusiva para reuniones de alto nivel con amenidades premium y vistas al skyline de la ciudad.',
      },
      {
        name: 'Terraza en Azotea',
        capacity: 80,
        area: 150.0,
        hourlyRate: 400.0,
        available: false, // Currently under maintenance
        location: 'Azotea - 20vo Piso',
        description:
          'Impresionante venue en azotea con vistas de 360 grados de la ciudad, perfecto para fiestas de cóctel y eventos exclusivos.',
      },
    ];

    for (const venueData of venues) {
      const existing = await this.venueRepository.findOne({
        where: { name: venueData.name },
      });

      if (!existing) {
        await this.venueRepository.save(venueData);
      }
    }
  }
}
