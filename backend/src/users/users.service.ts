import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new user
   */
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
    avatar?: string;
  }) {
    // Check if email already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existing) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'EDITOR',
        avatar: data.avatar
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });

    // Create default settings
    await this.prisma.userSettings.create({
      data: { userId: user.id }
    });

    return user;
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        _count: {
          select: {
            contents: true,
            editHistories: true
          }
        }
      }
    });
  }

  /**
   * Get all users with optional role filter
   */
  async getUsers(role?: UserRole) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { contents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId: number, data: {
    email?: string;
    name?: string;
    role?: UserRole;
    avatar?: string;
    isActive?: boolean;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // Check email uniqueness if changing
    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existing) {
        throw new BadRequestException('이미 사용 중인 이메일입니다.');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        updatedAt: true
      }
    });
  }

  /**
   * Soft delete user (set isActive=false)
   */
  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    return { success: true, message: '사용자가 비활성화되었습니다.' };
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: '비밀번호가 변경되었습니다.' };
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: number) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId }
      });
    }

    return settings;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: number, data: Partial<{
    notificationFrequency: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    targetViews: number;
    targetClickRate: number;
    favoriteMenus: string[];
    dashboardLayout: any;
    darkMode: string;
  }>) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });
  }

  /**
   * Reset user settings to defaults
   */
  async resetUserSettings(userId: number) {
    const existing = await this.prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!existing) {
      return this.prisma.userSettings.create({
        data: { userId }
      });
    }

    return this.prisma.userSettings.update({
      where: { userId },
      data: {
        notificationFrequency: 'REALTIME',
        emailNotifications: true,
        pushNotifications: true,
        targetViews: 1000,
        targetClickRate: 5.0,
        favoriteMenus: [],
        dashboardLayout: undefined,
        darkMode: 'AUTO'
      }
    });
  }

  /**
   * Get menu items based on user role
   */
  getMenusByRole(role: UserRole) {
    const baseMenus = [
      { id: 'dashboard', name: '대시보드', path: '/dashboard', icon: 'LayoutDashboard' },
    ];

    const roleMenus: Record<UserRole, Array<{ id: string; name: string; path: string; icon: string }>> = {
      ADMIN: [
        ...baseMenus,
        { id: 'content', name: '콘텐츠', path: '/dashboard/content', icon: 'FileText' },
        { id: 'pipeline', name: '발행 파이프라인', path: '/dashboard/pipeline', icon: 'GitBranch' },
        { id: 'calendar', name: '예약 캘린더', path: '/dashboard/calendar', icon: 'Calendar' },
        { id: 'analytics', name: '성과 분석', path: '/dashboard/analytics', icon: 'BarChart' },
        { id: 'monitoring', name: 'API 모니터링', path: '/dashboard/monitoring', icon: 'Activity' },
        { id: 'users', name: '사용자 관리', path: '/dashboard/users', icon: 'Users' },
        { id: 'settings', name: '설정', path: '/dashboard/settings', icon: 'Settings' },
      ],
      EDITOR: [
        ...baseMenus,
        { id: 'content', name: '콘텐츠', path: '/dashboard/content', icon: 'FileText' },
        { id: 'pipeline', name: '발행 파이프라인', path: '/dashboard/pipeline', icon: 'GitBranch' },
        { id: 'calendar', name: '예약 캘린더', path: '/dashboard/calendar', icon: 'Calendar' },
        { id: 'settings', name: '설정', path: '/dashboard/settings', icon: 'Settings' },
      ],
      MARKETER: [
        ...baseMenus,
        { id: 'content', name: '콘텐츠', path: '/dashboard/content', icon: 'FileText' },
        { id: 'analytics', name: '성과 분석', path: '/dashboard/analytics', icon: 'BarChart' },
        { id: 'calendar', name: '예약 캘린더', path: '/dashboard/calendar', icon: 'Calendar' },
        { id: 'settings', name: '설정', path: '/dashboard/settings', icon: 'Settings' },
      ],
      TECH_ADMIN: [
        ...baseMenus,
        { id: 'monitoring', name: 'API 모니터링', path: '/dashboard/monitoring', icon: 'Activity' },
        { id: 'analytics', name: '성과 분석', path: '/dashboard/analytics', icon: 'BarChart' },
        { id: 'settings', name: '설정', path: '/dashboard/settings', icon: 'Settings' },
      ],
    };

    return roleMenus[role];
  }

  /**
   * Get user productivity stats
   */
  async getProductivityStats(userId: number) {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [contentCount, editCount, publishCount] = await Promise.all([
      this.prisma.content.count({
        where: { authorId: userId, createdAt: { gte: lastMonth } }
      }),
      this.prisma.editHistory.count({
        where: { userId, createdAt: { gte: lastMonth } }
      }),
      this.prisma.editHistory.count({
        where: {
          userId,
          action: 'PUBLISH',
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    return {
      userId,
      period: '30일',
      contentsCreated: contentCount,
      editsCount: editCount,
      publishCount,
      avgContentsPerWeek: Math.round(contentCount / 4 * 10) / 10
    };
  }
}
