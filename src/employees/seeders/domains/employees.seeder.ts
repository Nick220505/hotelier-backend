import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../entities/employee.entity';
import { Department } from '../../enums/department.enum';
import { StaffStatus } from '../../enums/staff-status.enum';

@Injectable()
export class EmployeesSeeder {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async seed() {
    const employees = [
      // Housekeeping - High performers
      {
        employeeId: 'EMP001',
        name: 'Maria Rodriguez',
        department: Department.HOUSEKEEPING,
        position: 'Housekeeping Supervisor',
        shift: 'Morning',
        assignedRooms: 15,
        completedRooms: 14,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 2',
      },
      {
        employeeId: 'EMP003',
        name: 'Ana Garcia',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Morning',
        assignedRooms: 12,
        completedRooms: 11,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 3',
      },
      {
        employeeId: 'EMP007',
        name: 'Carmen Lopez',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Morning',
        assignedRooms: 10,
        completedRooms: 10,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 1',
      },
      {
        employeeId: 'EMP008',
        name: 'Patricia Sanchez',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Afternoon',
        assignedRooms: 11,
        completedRooms: 9,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 4',
      },
      {
        employeeId: 'EMP009',
        name: 'Elena Ramirez',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Morning',
        assignedRooms: 13,
        completedRooms: 9,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 2',
      },
      // Housekeeping - Medium/Low performers
      {
        employeeId: 'EMP010',
        name: 'Rosa Diaz',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Afternoon',
        assignedRooms: 10,
        completedRooms: 6,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 5',
      },
      {
        employeeId: 'EMP011',
        name: 'Isabel Torres',
        department: Department.HOUSEKEEPING,
        position: 'Laundry Attendant',
        shift: 'Morning',
        assignedRooms: 8,
        completedRooms: 5,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Laundry',
      },
      // Front Desk
      {
        employeeId: 'EMP002',
        name: 'Carlos Martinez',
        department: Department.FRONT_DESK,
        position: 'Front Desk Agent',
        shift: 'Day',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Reception',
      },
      {
        employeeId: 'EMP012',
        name: 'Andrea Fernandez',
        department: Department.FRONT_DESK,
        position: 'Front Desk Manager',
        shift: 'Morning',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Reception',
      },
      // Maintenance - with tasks
      {
        employeeId: 'EMP004',
        name: 'Luis Fernandez',
        department: Department.MAINTENANCE,
        position: 'Maintenance Technician',
        shift: 'Full Time',
        assignedRooms: 7,
        completedRooms: 6,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Maintenance Room',
      },
      {
        employeeId: 'EMP013',
        name: 'Miguel Santos',
        department: Department.MAINTENANCE,
        position: 'Electrician',
        shift: 'Day',
        assignedRooms: 5,
        completedRooms: 5,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 3',
      },
      {
        employeeId: 'EMP014',
        name: 'Jorge Morales',
        department: Department.MAINTENANCE,
        position: 'Plumber',
        shift: 'Day',
        assignedRooms: 6,
        completedRooms: 4,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Floor 1',
      },
      // Restaurant
      {
        employeeId: 'EMP005',
        name: 'Sofia Herrera',
        department: Department.RESTAURANT,
        position: 'Waitress',
        shift: 'Evening',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Restaurant',
      },
      {
        employeeId: 'EMP015',
        name: 'Daniela Castro',
        department: Department.RESTAURANT,
        position: 'Head Waitress',
        shift: 'Lunch',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Restaurant',
      },
      {
        employeeId: 'EMP016',
        name: 'Fernando Ruiz',
        department: Department.RESTAURANT,
        position: 'Chef',
        shift: 'Full Time',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Kitchen',
      },
      // Security
      {
        employeeId: 'EMP006',
        name: 'Roberto Silva',
        department: Department.SECURITY,
        position: 'Security Guard',
        shift: 'Night',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Main Entrance',
      },
      {
        employeeId: 'EMP017',
        name: 'Diego Vargas',
        department: Department.SECURITY,
        position: 'Security Guard',
        shift: 'Day',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Parking',
      },
      // Valet
      {
        employeeId: 'EMP018',
        name: 'Pedro Gomez',
        department: Department.VALET,
        position: 'Valet Attendant',
        shift: 'Day',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Valet Station',
      },
      {
        employeeId: 'EMP019',
        name: 'Javier Mendez',
        department: Department.VALET,
        position: 'Valet Attendant',
        shift: 'Evening',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Valet Station',
      },
      // Management
      {
        employeeId: 'EMP020',
        name: 'Gabriela Ortiz',
        department: Department.MANAGEMENT,
        position: 'Hotel Manager',
        shift: 'Full Time',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ACTIVE,
        currentLocation: 'Office',
      },
      // Inactive employees
      {
        employeeId: 'EMP021',
        name: 'Ricardo Nunez',
        department: Department.HOUSEKEEPING,
        position: 'Room Attendant',
        shift: 'Morning',
        assignedRooms: 0,
        completedRooms: 0,
        status: StaffStatus.ON_LEAVE,
        currentLocation: 'N/A',
      },
    ];

    for (const employeeData of employees) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { employeeId: employeeData.employeeId },
      });

      if (!existingEmployee) {
        await this.employeeRepository.save(employeeData);
      }
    }
  }
}
