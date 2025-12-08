"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createUser(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email }
        });
        if (existing) {
            throw new common_1.BadRequestException('이미 사용 중인 이메일입니다.');
        }
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
        await this.prisma.userSettings.create({
            data: { userId: user.id }
        });
        return user;
    }
    async getUser(userId) {
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
    async getUsers(role) {
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
    async updateUser(userId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        if (data.email && data.email !== user.email) {
            const existing = await this.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existing) {
                throw new common_1.BadRequestException('이미 사용 중인 이메일입니다.');
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
    async deleteUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        });
        return { success: true, message: '사용자가 비활성화되었습니다.' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('사용자를 찾을 수 없습니다.');
        }
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new common_1.BadRequestException('현재 비밀번호가 일치하지 않습니다.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        return { success: true, message: '비밀번호가 변경되었습니다.' };
    }
    async getUserSettings(userId) {
        let settings = await this.prisma.userSettings.findUnique({
            where: { userId }
        });
        if (!settings) {
            settings = await this.prisma.userSettings.create({
                data: { userId }
            });
        }
        return settings;
    }
    async updateUserSettings(userId, data) {
        return this.prisma.userSettings.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data
        });
    }
    async resetUserSettings(userId) {
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
    getMenusByRole(role) {
        const baseMenus = [
            { id: 'dashboard', name: '대시보드', path: '/dashboard', icon: 'LayoutDashboard' },
        ];
        const roleMenus = {
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
    async getProductivityStats(userId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map