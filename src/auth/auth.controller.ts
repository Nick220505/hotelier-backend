import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser, JwtRefreshUser } from './types/jwt-user';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditAction } from '../audit/enums/audit-action.enum';
import { AuditResource } from '../audit/enums/audit-resource.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @AuditLog({
    action: AuditAction.CREATE,
    resource: AuditResource.USER,
    description: 'User registered',
    includeBody: false, // Don't include password
  })
  @ApiOperation({
    summary: 'Register New User',
    description:
      'Register a new user account with email, password, and optional role assignment.',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already exists',
  })
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @AuditLog({
    action: AuditAction.LOGIN,
    resource: AuditResource.USER,
    description: 'User logged in',
    includeBody: false,
  })
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password, returning access and refresh tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() data: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(data);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @AuditLog({
    action: AuditAction.LOGOUT,
    resource: AuditResource.USER,
    description: 'User logged out',
  })
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout user and invalidate refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  logout(@CurrentUser() user: JwtUser): Promise<LogoutResponseDto> {
    return this.authService.logout(user.id);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Refresh access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    type: TokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Access denied',
  })
  refreshTokens(
    @CurrentUser() payload: JwtRefreshUser,
  ): Promise<TokenResponseDto> {
    const { sub, refreshToken } = payload;
    return this.authService.refreshTokens(sub, refreshToken ?? '');
  }

  @Get('test')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Test JWT Authentication',
    description: 'Test endpoint to verify JWT authentication is working.',
  })
  testAuth(@CurrentUser() user: JwtUser) {
    return { message: 'Authentication successful', user };
  }

  @Post('me')
  @ApiOperation({
    summary: 'Get User Profile',
    description:
      'Get current user profile information including roles and permissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  getProfile(@CurrentUser() user: JwtUser): Promise<ProfileResponseDto | null> {
    return this.authService.validateUser(user.id);
  }
}
