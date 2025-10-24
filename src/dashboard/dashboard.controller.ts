import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { RecentActivityDto } from './dto/recent-activity.dto';
import { RevenueDataDto } from './dto/revenue-data.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/types/jwt-user';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditResource } from '../audit/enums/audit-resource.enum';

@ApiTags('dashboard')
@Controller('dashboard')
@AuditLog({ resource: AuditResource.ANALYTICS })
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get Dashboard Statistics',
    description:
      'Retrieve key statistics for the hotel dashboard including room occupancy, revenue, and activity counts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    type: DashboardStatsDto,
  })
  async getDashboardStats(
    @CurrentUser() user: JwtUser,
  ): Promise<DashboardStatsDto> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not found in request');
    }
    return this.dashboardService.getDashboardStats(user.id);
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get Recent Activities',
    description:
      'Retrieve recent hotel activities including check-ins, check-outs, and maintenance events.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activities retrieved successfully',
    type: [RecentActivityDto],
  })
  async getRecentActivities(
    @CurrentUser() user: JwtUser,
  ): Promise<RecentActivityDto[]> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not found in request');
    }
    return this.dashboardService.getRecentActivities(user.id);
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Get Revenue Data',
    description:
      'Retrieve daily revenue data for the past week for dashboard charts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Revenue data retrieved successfully',
    type: [RevenueDataDto],
  })
  async getRevenueData(
    @CurrentUser() user: JwtUser,
  ): Promise<RevenueDataDto[]> {
    if (!user || !user.id) {
      throw new UnauthorizedException('User not found in request');
    }
    return this.dashboardService.getRevenueData(user.id);
  }
}
