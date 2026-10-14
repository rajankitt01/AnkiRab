import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../config/db';
import { AppError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string };
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.ankirab_token) {
      token = req.cookies.ankirab_token;
    }

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const decoded = verifyAccessToken(token);

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, username: true, role: true }
    });

    if (!user) {
      throw new AppError('User account not found or has been removed.', 401);
    }

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err: unknown) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError('Invalid or expired authentication token', 401));
  }
}

export function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.ankirab_token) {
      token = req.cookies.ankirab_token;
    }

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    req.user = {
      userId: decoded.userId,
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch {
    // Silently continue for optional auth
    next();
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('Access denied. Administrator privileges required.', 403)
      );
    }

    next();
  };
}
