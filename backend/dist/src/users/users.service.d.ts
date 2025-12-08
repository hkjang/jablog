import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    createUser(data: {
        email: string;
        password: string;
        name: string;
        role?: UserRole;
        avatar?: string;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    getUser(userId: number): Promise<({
        settings: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            notificationFrequency: string;
            emailNotifications: boolean;
            pushNotifications: boolean;
            targetViews: number;
            targetClickRate: number;
            favoriteMenus: string[];
            dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
            darkMode: string;
            userId: number;
        } | null;
        _count: {
            contents: number;
            editHistories: number;
        };
    } & {
        id: number;
        email: string;
        password: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    getUsers(role?: UserRole): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
        _count: {
            contents: number;
        };
    }[]>;
    updateUser(userId: number, data: {
        email?: string;
        name?: string;
        role?: UserRole;
        avatar?: string;
        isActive?: boolean;
    }): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("@prisma/client").$Enums.UserRole;
        avatar: string | null;
        isActive: boolean;
        updatedAt: Date;
    }>;
    deleteUser(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserSettings(userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        notificationFrequency: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        targetViews: number;
        targetClickRate: number;
        favoriteMenus: string[];
        dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
        darkMode: string;
        userId: number;
    }>;
    updateUserSettings(userId: number, data: Partial<{
        notificationFrequency: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        targetViews: number;
        targetClickRate: number;
        favoriteMenus: string[];
        dashboardLayout: any;
        darkMode: string;
    }>): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        notificationFrequency: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        targetViews: number;
        targetClickRate: number;
        favoriteMenus: string[];
        dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
        darkMode: string;
        userId: number;
    }>;
    resetUserSettings(userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        notificationFrequency: string;
        emailNotifications: boolean;
        pushNotifications: boolean;
        targetViews: number;
        targetClickRate: number;
        favoriteMenus: string[];
        dashboardLayout: import("@prisma/client/runtime/library").JsonValue | null;
        darkMode: string;
        userId: number;
    }>;
    getMenusByRole(role: UserRole): {
        id: string;
        name: string;
        path: string;
        icon: string;
    }[];
    getProductivityStats(userId: number): Promise<{
        userId: number;
        period: string;
        contentsCreated: number;
        editsCount: number;
        publishCount: number;
        avgContentsPerWeek: number;
    }>;
}
