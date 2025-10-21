import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone, roleId } = data;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default 'guest' role if no role specified
    const user = await this.userRepository.save({
      email,
      password: hashedPassword,
      name,
      phone,
    });

    // Assign role to user
    const defaultRoleId = roleId || (await this.getDefaultRole());
    await this.userRoleRepository.save({
      userId: user.id,
      roleId: defaultRoleId,
      assignedBy: 'system',
    });

    // Reload user with relations
    const userWithRoles = await this.getUserWithRoles(user.id);
    if (!userWithRoles) {
      throw new InternalServerErrorException('Failed to create user');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Extract roles in the expected format
    const roles = userWithRoles.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description || undefined,
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refreshToken, userRoles, ...userData } = userWithRoles;

    return {
      user: {
        ...userData,
        roles,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with roles and permissions (include password for authentication)
    const user = await this.getUserWithRolesAndPassword(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await this.userRepository.update(user.id, { lastLogin: new Date() });

    // Get flattened permissions
    const permissions = await this.getUserPermissions(user.id);

    // Extract roles in the expected format
    const roles = user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description || undefined,
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refreshToken, userRoles, ...userData } = user;

    return {
      user: {
        ...userData,
        roles,
        permissions,
      },
      ...tokens,
    };
  }

  async logout(userId: number): Promise<LogoutResponseDto> {
    await this.userRepository.update(userId, { refreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<TokenResponseDto> {
    const user = await this.getUserWithRefreshToken(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async validateUser(userId: number): Promise<ProfileResponseDto | null> {
    const user = await this.getUserWithRoles(userId);

    if (!user || !user.isActive) {
      return null;
    }

    // Get flattened permissions
    const permissions = await this.getUserPermissions(user.id);

    // Extract roles in the expected format
    const roles = user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description || undefined,
    }));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userRoles, ...result } = user;

    return {
      ...result,
      roles,
      permissions,
    };
  }

  async getTokens(userId: number, email: string): Promise<TokenResponseDto> {
    const payload = {
      sub: userId,
      email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getDefaultRole(roleId?: number): Promise<number> {
    if (roleId) {
      return roleId;
    }

    const defaultRole = await this.roleRepository.findOne({
      where: { name: 'cliente' },
    });

    if (!defaultRole) {
      throw new InternalServerErrorException(
        'Default cliente role not found. Please run database seeds.',
      );
    }

    return defaultRole.id;
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.getUserWithRoles(userId);

    if (!user) {
      return [];
    }

    const permissions = new Set<string>();

    for (const userRole of user.userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        const perm = `${rolePermission.permission.resource}:${rolePermission.permission.action}`;
        permissions.add(perm);
      }
    }

    return Array.from(permissions);
  }

  // Helper method to get user with all relations
  private async getUserWithRoles(
    identifier: number | string,
  ): Promise<User | null> {
    const where =
      typeof identifier === 'number'
        ? { id: identifier }
        : { email: identifier };

    return await this.userRepository.findOne({
      where,
      relations: {
        userRoles: {
          role: {
            permissions: {
              permission: true,
            },
          },
        },
      },
    });
  }

  // Helper method to get user with password for authentication
  private async getUserWithRolesAndPassword(
    identifier: number | string,
  ): Promise<User | null> {
    const where =
      typeof identifier === 'number'
        ? { id: identifier }
        : { email: identifier };

    return await this.userRepository.findOne({
      where,
      select: {
        id: true,
        email: true,
        password: true, // Explicitly select password for authentication
        name: true,
        phone: true,
        loyaltyPoints: true,
        loyaltyLevel: true,
        preferences: true,
        registrationDate: true,
        lastVisit: true,
        createdAt: true,
        updatedAt: true,
        firstVisit: true,
        isActive: true,
        lastLogin: true,
      },
      relations: {
        userRoles: {
          role: {
            permissions: {
              permission: true,
            },
          },
        },
      },
    });
  }

  // Helper method to get user with refresh token for token refresh
  private async getUserWithRefreshToken(userId: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        refreshToken: true, // Explicitly select refresh token
        isActive: true,
      },
    });
  }
}
