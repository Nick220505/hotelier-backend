import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UserRole } from '../../entities/user-role.entity';
import { LoyaltyLevel } from '../../enums/loyalty-level.enum';

@Injectable()
export class UsersSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async seed() {
    const users = [
      {
        email: 'admin@hotelier.com',
        password: 'Admin@123',
        name: 'Administrador del Sistema',
        phone: '+1234567890',
        loyaltyLevel: LoyaltyLevel.PLATINUM,
        isActive: true,
        roles: ['administrador'],
      },
      {
        email: 'gerente@hotelier.com',
        password: 'Staff@123',
        name: 'Gerente del Hotel',
        phone: '+1234567891',
        loyaltyLevel: LoyaltyLevel.GOLD,
        isActive: true,
        roles: ['gerente'],
      },
      {
        email: 'recepcion@hotelier.com',
        password: 'Staff@123',
        name: 'Personal de Recepción',
        phone: '+1234567892',
        loyaltyLevel: LoyaltyLevel.SILVER,
        isActive: true,
        roles: ['recepcionista'],
      },
      {
        email: 'cliente@hotelier.com',
        password: 'Guest@123',
        name: 'Cliente de Prueba',
        phone: '+1234567893',
        loyaltyLevel: LoyaltyLevel.BRONZE,
        isActive: true,
        roles: ['cliente'],
      },
      {
        email: 'limpieza@hotelier.com',
        password: 'Staff@123',
        name: 'Personal de Limpieza',
        phone: '+1234567894',
        loyaltyLevel: LoyaltyLevel.BRONZE,
        isActive: true,
        roles: ['personal_limpieza'],
      },
      {
        email: 'mantenimiento@hotelier.com',
        password: 'Staff@123',
        name: 'Personal de Mantenimiento',
        phone: '+1234567895',
        loyaltyLevel: LoyaltyLevel.BRONZE,
        isActive: true,
        roles: ['mantenimiento'],
      },
      {
        email: 'restaurante@hotelier.com',
        password: 'Staff@123',
        name: 'Personal de Restaurante',
        phone: '+1234567896',
        loyaltyLevel: LoyaltyLevel.BRONZE,
        isActive: true,
        roles: ['personal_restaurante'],
      },
    ];

    for (const userData of users) {
      await this.createUserIfNotExists(userData);
    }
  }

  private async createUserIfNotExists(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    loyaltyLevel: LoyaltyLevel;
    isActive?: boolean;
    roles: string[];
  }) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await this.userRepository.save({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        loyaltyLevel: userData.loyaltyLevel,
        isActive: userData.isActive,
        registrationDate: new Date(),
      });

      // Assign roles to user
      await this.assignRolesToUser(user, userData.roles);
    } else {
      // Update existing user with new password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await this.userRepository.update(existingUser.id, {
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone,
        loyaltyLevel: userData.loyaltyLevel,
        isActive: userData.isActive,
      });

      console.log(`Updated user: ${userData.email}`);
    }
  }

  private async assignRolesToUser(user: User, roleNames: string[]) {
    for (const roleName of roleNames) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (role) {
        await this.userRoleRepository.save({
          userId: user.id,
          roleId: role.id,
          assignedBy: 'system',
        });
      }
    }
  }
}
