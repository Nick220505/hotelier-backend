import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthService } from '../auth.service';
import type { JwtUser } from '../types/jwt-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if this is a public route
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    // Check role-based access
    if (requiredRoles) {
      // Load user roles from database
      const userWithRoles = await this.authService.validateUser(user.id);
      if (!userWithRoles || !userWithRoles.roles) {
        return false;
      }

      const userRoleNames = userWithRoles.roles.map((role) => role.name);
      const hasRole = requiredRoles.some((role) =>
        userRoleNames.includes(role),
      );

      if (!hasRole) {
        return false;
      }
    }

    // Check permission-based access
    if (requiredPermissions) {
      // Load user permissions from database
      const userWithPermissions = await this.authService.validateUser(user.id);

      if (!userWithPermissions || !userWithPermissions.permissions) {
        return false;
      }

      const hasPermission = requiredPermissions.some((permission) =>
        userWithPermissions.permissions.includes(permission),
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  }
}
