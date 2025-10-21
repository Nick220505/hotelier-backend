import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      headers?: Record<string, any>;
      ip?: string;
      user?: { id?: number };
      body?: any;
    }>();

    // Skip non-HTTP contexts (e.g., ws)
    if (!req) return next.handle();

    // Skip swagger and health endpoints
    const url = req.url || '';
    if (
      url === '/api' ||
      url.startsWith('/api-json') ||
      url.includes('swagger') ||
      url.includes('/health')
    ) {
      return next.handle();
    }

    const method = req.method;
    const moduleName = this.deriveModuleName(url);

    return next.handle().pipe(
      tap(() => {
        // Create audit log synchronously to avoid promise warning
        this.auditRepo
          .save({
            action: method,
            module: moduleName,
            userId: req.user?.id ?? null,
            method,
            url,
            ip: req.ip,
            userAgent: (req.headers?.['user-agent'] ??
              req.headers?.['User-Agent']) as string,
            payload: this.safeStringify(req.body),
          })
          .catch(() => {
            // Non-blocking failure; ignore
          });
      }),
    );
  }

  private deriveModuleName(url: string): string {
    // Expect paths like /api/<module>/...
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'api') return parts[1];
    if (parts.length >= 1) return parts[0];
    return 'root';
  }

  private safeStringify(obj: any): string | null {
    try {
      if (obj == null) return null;
      return JSON.stringify(obj).slice(0, 4000); // cap size
    } catch {
      return null;
    }
  }
}
