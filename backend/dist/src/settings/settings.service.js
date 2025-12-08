"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = SettingsService_1 = class SettingsService {
    prisma;
    logger = new common_1.Logger(SettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformCredentials(userId) {
        return this.prisma.platformCredential.findMany({
            where: { userId },
            select: {
                id: true,
                platform: true,
                name: true,
                blogName: true,
                siteUrl: true,
                isActive: true,
                lastTestedAt: true,
                lastTestResult: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getPlatformCredential(id) {
        const credential = await this.prisma.platformCredential.findUnique({
            where: { id },
            select: {
                id: true,
                userId: true,
                platform: true,
                name: true,
                blogName: true,
                siteUrl: true,
                username: true,
                isActive: true,
                lastTestedAt: true,
                lastTestResult: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        if (!credential) {
            throw new common_1.NotFoundException('플랫폼 자격증명을 찾을 수 없습니다.');
        }
        return credential;
    }
    async createPlatformCredential(data) {
        const existing = await this.prisma.platformCredential.findFirst({
            where: {
                userId: data.userId,
                platform: data.platform,
                name: data.name
            }
        });
        if (existing) {
            throw new common_1.BadRequestException('동일한 이름의 플랫폼 연동이 이미 존재합니다.');
        }
        return this.prisma.platformCredential.create({
            data: {
                userId: data.userId,
                platform: data.platform,
                name: data.name,
                blogName: data.blogName,
                accessToken: data.accessToken,
                apiKey: data.apiKey,
                username: data.username,
                appPassword: data.appPassword,
                siteUrl: data.siteUrl
            },
            select: {
                id: true,
                platform: true,
                name: true,
                blogName: true,
                siteUrl: true,
                isActive: true,
                createdAt: true
            }
        });
    }
    async updatePlatformCredential(id, data) {
        const credential = await this.prisma.platformCredential.findUnique({
            where: { id }
        });
        if (!credential) {
            throw new common_1.NotFoundException('플랫폼 자격증명을 찾을 수 없습니다.');
        }
        return this.prisma.platformCredential.update({
            where: { id },
            data,
            select: {
                id: true,
                platform: true,
                name: true,
                blogName: true,
                siteUrl: true,
                isActive: true,
                updatedAt: true
            }
        });
    }
    async deletePlatformCredential(id) {
        const credential = await this.prisma.platformCredential.findUnique({
            where: { id }
        });
        if (!credential) {
            throw new common_1.NotFoundException('플랫폼 자격증명을 찾을 수 없습니다.');
        }
        await this.prisma.platformCredential.delete({
            where: { id }
        });
        return { success: true, message: '플랫폼 연동이 삭제되었습니다.' };
    }
    async testPlatformConnection(id) {
        const credential = await this.prisma.platformCredential.findUnique({
            where: { id }
        });
        if (!credential) {
            throw new common_1.NotFoundException('플랫폼 자격증명을 찾을 수 없습니다.');
        }
        let success = false;
        let message = '';
        try {
            if (credential.platform === 'TISTORY') {
                success = await this.testTistoryConnection(credential);
                message = success ? 'Tistory 연결 성공' : 'Tistory 연결 실패';
            }
            else if (credential.platform === 'WORDPRESS') {
                const result = await this.testWordpressConnection(credential);
                success = result.success;
                message = success ? 'WordPress 연결 성공' : `WordPress 연결 실패: ${result.error || '알 수 없는 오류'}`;
            }
            else {
                message = '지원하지 않는 플랫폼입니다.';
            }
        }
        catch (error) {
            this.logger.error(`Connection test failed for credential ${id}`, error);
            message = `연결 테스트 실패: ${error.message}`;
        }
        await this.prisma.platformCredential.update({
            where: { id },
            data: {
                lastTestedAt: new Date(),
                lastTestResult: success ? 'SUCCESS' : 'FAILED'
            }
        });
        return { success, message, testedAt: new Date() };
    }
    async testTistoryConnection(credential) {
        if (!credential.accessToken || !credential.blogName) {
            return false;
        }
        try {
            const formData = new URLSearchParams();
            formData.append('access_token', credential.accessToken);
            formData.append('output', 'json');
            formData.append('blogName', credential.blogName);
            const response = await fetch('https://www.tistory.com/apis/blog/info', {
                method: 'POST',
                body: formData
            });
            if (!response.ok)
                return false;
            const data = await response.json();
            return data.tistory?.status === '200';
        }
        catch (error) {
            this.logger.error('Tistory connection test failed', error);
            return false;
        }
    }
    async testWordpressConnection(credential) {
        const missing = [];
        if (!credential.siteUrl)
            missing.push('Site URL');
        if (!credential.username)
            missing.push('Username');
        if (!credential.appPassword)
            missing.push('App Password');
        if (missing.length > 0) {
            const error = `필수 필드 누락: ${missing.join(', ')}`;
            this.logger.warn(`WordPress connection test skipped: ${error}`);
            return { success: false, error };
        }
        const siteUrl = credential.siteUrl.replace(/\/+$/, '');
        const apiUrl = `${siteUrl}/wp-json/wp/v2/users/me`;
        this.logger.log(`Testing WordPress connection to: ${siteUrl}`);
        try {
            const auth = Buffer.from(`${credential.username}:${credential.appPassword}`).toString('base64');
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });
            if (response.ok) {
                this.logger.log('WordPress connection test successful');
                return { success: true };
            }
            else {
                const errorText = await response.text();
                const error = `HTTP ${response.status}: ${errorText.substring(0, 200)}`;
                this.logger.warn(`WordPress connection test failed: ${error}`);
                return { success: false, error };
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error('WordPress connection test failed', error);
            return { success: false, error: `연결 오류: ${errorMsg}` };
        }
    }
    async getAiSettings(userId) {
        let settings = await this.prisma.aiSettings.findUnique({
            where: { userId }
        });
        if (!settings) {
            settings = await this.prisma.aiSettings.create({
                data: { userId }
            });
        }
        return {
            ...settings,
            apiKey: settings.apiKey ? '••••••••' : null
        };
    }
    async updateAiSettings(userId, data) {
        const updateData = { ...data };
        if (updateData.apiKey === '••••••••') {
            delete updateData.apiKey;
        }
        return this.prisma.aiSettings.upsert({
            where: { userId },
            create: { userId, ...updateData },
            update: updateData,
            select: {
                id: true,
                provider: true,
                model: true,
                apiUrl: true,
                temperature: true,
                maxTokens: true,
                systemPrompt: true,
                contentPrompt: true,
                titlePrompt: true,
                autoSeoOptimize: true,
                autoTranslate: true,
                updatedAt: true
            }
        });
    }
    async resetAiSettings(userId) {
        const existing = await this.prisma.aiSettings.findUnique({
            where: { userId }
        });
        if (!existing) {
            return this.prisma.aiSettings.create({
                data: { userId }
            });
        }
        return this.prisma.aiSettings.update({
            where: { userId },
            data: {
                provider: 'OLLAMA',
                model: 'llama3',
                apiKey: null,
                apiUrl: null,
                temperature: 0.7,
                maxTokens: 2000,
                systemPrompt: null,
                contentPrompt: null,
                titlePrompt: null,
                autoSeoOptimize: true,
                autoTranslate: false
            }
        });
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map