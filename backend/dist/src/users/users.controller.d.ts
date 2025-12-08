import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    getUser(id: number): Promise<({
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
    updateUser(id: number, data: {
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
    deleteUser(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    changePassword(id: number, data: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getUserSettings(id: number): Promise<{
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
    updateUserSettings(id: number, data: any): Promise<{
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
    resetUserSettings(id: number): Promise<{
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
    getUserMenus(id: number): Promise<{
        id: string;
        name: string;
        path: string;
        icon: string;
    }[]>;
    getProductivityStats(id: number): Promise<{
        userId: number;
        period: string;
        contentsCreated: number;
        editsCount: number;
        publishCount: number;
        avgContentsPerWeek: number;
    }>;
}
