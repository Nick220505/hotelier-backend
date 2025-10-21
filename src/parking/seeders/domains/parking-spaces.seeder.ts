import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingSpace } from '../../entities/parking-space.entity';
import { SpaceType } from '../../enums/space-type.enum';
import { SpaceStatus } from '../../enums/space-status.enum';

@Injectable()
export class ParkingSpacesSeeder {
  constructor(
    @InjectRepository(ParkingSpace)
    private parkingSpaceRepository: Repository<ParkingSpace>,
  ) {}

  async seed() {
    const parkingSpaces = [
      // Parqueadero de Huéspedes - Planta Baja
      {
        code: 'G-001',
        zone: 'Planta Baja',
        type: SpaceType.GUEST,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 5.0,
        location: 'Planta Baja - Fila A',
      },
      {
        code: 'G-002',
        zone: 'Planta Baja',
        type: SpaceType.GUEST,
        status: SpaceStatus.OCCUPIED,
        currentVehicle: 'ABC-123',
        hourlyRate: 5.0,
        location: 'Planta Baja - Fila A',
      },
      {
        code: 'G-003',
        zone: 'Planta Baja',
        type: SpaceType.GUEST,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 5.0,
        location: 'Planta Baja - Fila A',
      },

      // Parqueadero VIP
      {
        code: 'VIP-001',
        zone: 'Sección VIP',
        type: SpaceType.VIP,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 15.0,
        location: 'Planta Baja - Área VIP',
      },
      {
        code: 'VIP-002',
        zone: 'Sección VIP',
        type: SpaceType.VIP,
        status: SpaceStatus.RESERVED,
        hourlyRate: 15.0,
        location: 'Planta Baja - Área VIP',
      },

      // Parqueadero para Personas con Discapacidad
      {
        code: 'DIS-001',
        zone: 'Accesibilidad',
        type: SpaceType.DISABLED,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 0.0,
        location: 'Planta Baja - Cerca de la Entrada',
      },
      {
        code: 'DIS-002',
        zone: 'Accesibilidad',
        type: SpaceType.DISABLED,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 0.0,
        location: 'Planta Baja - Cerca de la Entrada',
      },

      // Parqueadero de Empleados
      {
        code: 'EMP-001',
        zone: 'Área de Empleados',
        type: SpaceType.EMPLOYEE,
        status: SpaceStatus.OCCUPIED,
        currentVehicle: 'EMP-456',
        hourlyRate: 0.0,
        location: 'Subterráneo - Nivel B1',
      },
      {
        code: 'EMP-002',
        zone: 'Área de Empleados',
        type: SpaceType.EMPLOYEE,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 0.0,
        location: 'Subterráneo - Nivel B1',
      },

      // Parqueadero de Visitantes
      {
        code: 'VIS-001',
        zone: 'Área de Visitantes',
        type: SpaceType.VISITOR,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 3.0,
        location: 'Planta Baja - Fila C',
      },

      // Zona de Carga
      {
        code: 'LOAD-001',
        zone: 'Área de Servicios',
        type: SpaceType.LOADING,
        status: SpaceStatus.AVAILABLE,
        hourlyRate: 0.0,
        location: 'Planta Baja - Muelle de Carga',
      },

      // Mantenimiento
      {
        code: 'G-004',
        zone: 'Planta Baja',
        type: SpaceType.GUEST,
        status: SpaceStatus.MAINTENANCE,
        hourlyRate: 5.0,
        location: 'Planta Baja - Fila B',
      },
    ];

    for (const spaceData of parkingSpaces) {
      const existing = await this.parkingSpaceRepository.findOne({
        where: { code: spaceData.code },
      });

      if (!existing) {
        await this.parkingSpaceRepository.save(spaceData);
      }
    }
  }
}
