import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingIncident } from '../../entities/parking-incident.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { ParkingSpace } from '../../entities/parking-space.entity';
import { IncidentType } from '../../enums/incident-type.enum';
import { IncidentStatus } from '../../enums/incident-status.enum';
import { TaskPriority } from '../../../housekeeping/enums/task-priority.enum';

@Injectable()
export class ParkingIncidentsSeeder {
  constructor(
    @InjectRepository(ParkingIncident)
    private incidentRepository: Repository<ParkingIncident>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ParkingSpace)
    private parkingSpaceRepository: Repository<ParkingSpace>,
  ) {}

  async seed() {
    const vehicles = await this.vehicleRepository.find({ take: 3 });
    const parkingSpaces = await this.parkingSpaceRepository.find({ take: 3 });

    const incidents = [
      {
        type: IncidentType.VEHICLE_DAMAGE,
        description:
          'Rayón menor en el parachoques trasero, posiblemente causado por otro vehículo',
        reportDate: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
        status: IncidentStatus.RESOLVED,
        responsible: 'Equipo de Seguridad',
        priority: TaskPriority.NORMAL,
        resolution:
          'Incidente documentado, propietario del vehículo notificado, seguro contactado',
        resolvedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
        vehicleId: vehicles[0]?.id,
        spaceId: parkingSpaces[0]?.id,
      },
      {
        type: IncidentType.SECURITY,
        description:
          'Vehículo no autorizado estacionado en espacio VIP sin permiso',
        reportDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        status: IncidentStatus.IN_PROGRESS,
        responsible: 'Guardia de Seguridad',
        priority: TaskPriority.HIGH,
        vehicleId: vehicles[1]?.id,
        spaceId: parkingSpaces[1]?.id,
      },
      {
        type: IncidentType.INFRASTRUCTURE,
        description:
          'Falla en la barrera del parqueadero - no abre automáticamente',
        reportDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        status: IncidentStatus.PENDING,
        responsible: 'Equipo de Mantenimiento',
        priority: TaskPriority.HIGH,
        spaceId: parkingSpaces[2]?.id,
      },
      {
        type: IncidentType.ACCIDENT,
        description:
          'Colisión menor entre dos vehículos durante el estacionamiento',
        reportDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 días atrás
        status: IncidentStatus.RESOLVED,
        responsible: 'Gerente de Seguridad',
        priority: TaskPriority.URGENT,
        resolution:
          'Seguro de ambas partes contactado, espacio de parqueadero cerrado temporalmente para investigación',
        resolvedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 horas atrás
      },
      {
        type: IncidentType.OTHER,
        description:
          'Huésped dejó las llaves dentro del vehículo, solicitó asistencia',
        reportDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        status: IncidentStatus.RESOLVED,
        responsible: 'Recepción',
        priority: TaskPriority.NORMAL,
        resolution: 'Cerrajero contactado, vehículo abierto, huésped asistido',
        resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
        vehicleId: vehicles[0]?.id,
      },
    ];

    for (const incidentData of incidents) {
      const existing = await this.incidentRepository.findOne({
        where: {
          type: incidentData.type,
          description: incidentData.description,
        },
      });

      if (!existing) {
        await this.incidentRepository.save(incidentData);
      }
    }
  }
}
