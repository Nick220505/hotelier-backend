import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      relations: { userRoles: { role: true } },
      order: { createdAt: 'DESC' },
    });
    return this.transformUsersForApi(users);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.transformUserForApi(user);
  }

  async create(userData: Partial<User>): Promise<User> {
    return this.userRepository.save(userData);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.update(id, userData);
    const updated = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    return updated!;
  }

  async remove(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
    return user;
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(id, {
      refreshToken: refreshToken || undefined,
    });
  }

  async activate(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.update(id, { isActive: true });
    const updated = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    return updated!;
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.userRepository.update(id, { isActive: false });
    const updated = await this.userRepository.findOne({
      where: { id },
      relations: { userRoles: { role: true } },
    });
    return updated!;
  }

  private transformUserForApi(user: User): UserResponseDto {
    const dto: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyLevel: user.loyaltyLevel,
      preferences: user.preferences,
      registrationDate: user.registrationDate,
      lastVisit: user.lastVisit,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      firstVisit: user.firstVisit,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })),
    };
    return dto;
  }

  private transformUsersForApi(users: User[]): UserResponseDto[] {
    return users.map((user) => this.transformUserForApi(user));
  }
}
