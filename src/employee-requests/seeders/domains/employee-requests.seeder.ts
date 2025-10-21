import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeRequest } from '../../entities/employee-request.entity';
import { RequestType } from '../../enums/request-type.enum';
import { RequestStatus } from '../../enums/request-status.enum';
import { Employee } from '../../../employees/entities/employee.entity';

@Injectable()
export class EmployeeRequestsSeeder {
  constructor(
    @InjectRepository(EmployeeRequest)
    private readonly employeeRequestRepository: Repository<EmployeeRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async seed() {
    // Get existing employees to create requests for
    const employees = await this.employeeRepository.find();

    if (employees.length === 0) {
      console.log('No employees found, skipping employee requests seeding');
      return;
    }

    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const requests = [
      // Pending vacation requests
      {
        type: RequestType.VACATION,
        reason: 'Vacaciones familiares - viaje a la playa',
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
        days: 5,
        status: RequestStatus.PENDING,
        employeeId: employees[0].id, // Maria Rodriguez
      },
      {
        type: RequestType.VACATION,
        reason: 'Descanso personal',
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        days: 7,
        status: RequestStatus.PENDING,
        employeeId: employees[1]?.id || employees[0].id, // Carlos Martinez
      },

      // Approved requests
      {
        type: RequestType.SICK_LEAVE,
        reason: 'Cita médica - control rutinario',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Same day
        days: 1,
        status: RequestStatus.APPROVED,
        approvedBy: 'Gerente General',
        employeeId: employees[2]?.id || employees[0].id, // Ana Garcia
      },
      {
        type: RequestType.PERSONAL,
        reason: 'Asuntos personales - trámites bancarios',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Same day
        days: 1,
        status: RequestStatus.APPROVED,
        approvedBy: 'Supervisor de Área',
        employeeId: employees[3]?.id || employees[0].id, // Luis Fernandez
      },

      // Recent requests - some approved, some rejected
      {
        type: RequestType.VACATION,
        reason: 'Vacaciones de verano',
        startDate: lastWeek,
        endDate: new Date(lastWeek.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days later
        days: 10,
        status: RequestStatus.APPROVED,
        approvedBy: 'Gerente de Recursos Humanos',
        employeeId: employees[4]?.id || employees[0].id, // Sofia Herrera
      },
      {
        type: RequestType.OTHER,
        reason: 'Participación en conferencia profesional',
        startDate: new Date(lastWeek.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before last week
        endDate: new Date(lastWeek.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day before last week
        days: 2,
        status: RequestStatus.REJECTED,
        employeeId: employees[5]?.id || employees[0].id, // Roberto Silva
      },

      // Old requests for history
      {
        type: RequestType.SICK_LEAVE,
        reason: 'Incapacidad médica - gripe',
        startDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        endDate: new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
        days: 3,
        status: RequestStatus.APPROVED,
        approvedBy: 'Gerente de Área',
        employeeId: employees[0].id, // Maria Rodriguez
      },
      {
        type: RequestType.PERSONAL,
        reason: 'Mudanza de domicilio',
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
        endDate: new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
        days: 1,
        status: RequestStatus.CANCELLED,
        employeeId: employees[1]?.id || employees[0].id, // Carlos Martinez
      },

      // More pending requests
      {
        type: RequestType.VACATION,
        reason: 'Vacaciones de fin de año',
        startDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), // 2 months from now
        endDate: new Date(today.getTime() + 65 * 24 * 60 * 60 * 1000), // 5 days later
        days: 5,
        status: RequestStatus.PENDING,
        employeeId: employees[2]?.id || employees[0].id, // Ana Garcia
      },
      {
        type: RequestType.SICK_LEAVE,
        reason: 'Cirugía programada',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000), // 1 week later
        days: 7,
        status: RequestStatus.PENDING,
        employeeId: employees[3]?.id || employees[0].id, // Luis Fernandez
      },
    ];

    for (const requestData of requests) {
      const existingRequest = await this.employeeRequestRepository.findOne({
        where: {
          employeeId: requestData.employeeId,
          startDate: requestData.startDate,
          type: requestData.type,
        },
      });

      if (!existingRequest) {
        const request = this.employeeRequestRepository.create(requestData);
        await this.employeeRequestRepository.save(request);
      }
    }

    console.log('✅ Employee requests seeded');
  }
}
