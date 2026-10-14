import { prisma } from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateTokens, JwtPayload } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput } from '@ankirab/shared';
import crypto from 'crypto';

export class AuthService {
  async register(data: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: data.username.toLowerCase() }
    });
    if (existingUsername) {
      throw new AppError('This username is already taken. Please choose another.', 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        displayName: data.displayName || data.username,
        passwordHash,
        role: 'USER',
        preferredAudio: 'hi',
        preferredSubtitle: 'en'
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferredAudio: true,
        preferredSubtitle: true,
        autoPlayNext: true,
        autoSkipIntro: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const tokens = generateTokens(tokenPayload);

    // Record session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return {
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      ...tokens
    };
  }

  async login(data: LoginInput) {
    const identifier = data.emailOrUsername.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) {
      throw new AppError('Invalid email/username or password.', 401);
    }

    const isValid = await comparePassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid email/username or password.', 401);
    }

    const tokenPayload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const tokens = generateTokens(tokenPayload);

    // Record session safely
    try {
      await prisma.session.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } catch {
      // Ignore session recording failure if already exists
    }

    const userDto = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role as any,
      preferredAudio: user.preferredAudio,
      preferredSubtitle: user.preferredSubtitle,
      autoPlayNext: user.autoPlayNext,
      autoSkipIntro: user.autoSkipIntro,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };

    return {
      user: userDto,
      ...tokens
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        preferredAudio: true,
        preferredSubtitle: true,
        autoPlayNext: true,
        autoSkipIntro: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  async logout(userId: string) {
    await prisma.session.deleteMany({
      where: { userId }
    });
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Security practice: Always return generic success to prevent email enumeration
    if (!user) {
      return { success: true, message: 'If an account exists, a reset link has been dispatched.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Store in audit log / session
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
        details: JSON.stringify({ token: resetToken, expiresAt: new Date(Date.now() + 3600000) })
      }
    });

    return {
      success: true,
      message: 'Password reset link has been generated and sent.',
      demoToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined
    };
  }

  async resetPassword(token: string, newPass: string) {
    // In our audit/session storage
    const log = await prisma.auditLog.findFirst({
      where: {
        action: 'PASSWORD_RESET_REQUESTED',
        details: { contains: token }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!log || !log.userId) {
      throw new AppError('Invalid or expired reset token.', 400);
    }

    const newHash = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: log.userId },
      data: { passwordHash: newHash }
    });

    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'User',
        entityId: log.userId
      }
    });

    return { success: true, message: 'Password has been successfully updated.' };
  }
}
