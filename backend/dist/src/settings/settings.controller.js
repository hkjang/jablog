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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async getPlatformCredentials(userId) {
        return this.settingsService.getPlatformCredentials(userId);
    }
    async getPlatformCredential(id) {
        return this.settingsService.getPlatformCredential(id);
    }
    async createPlatformCredential(data) {
        return this.settingsService.createPlatformCredential(data);
    }
    async updatePlatformCredential(id, data) {
        return this.settingsService.updatePlatformCredential(id, data);
    }
    async deletePlatformCredential(id) {
        return this.settingsService.deletePlatformCredential(id);
    }
    async testPlatformConnection(id) {
        return this.settingsService.testPlatformConnection(id);
    }
    async getAiSettings(userId) {
        return this.settingsService.getAiSettings(userId);
    }
    async updateAiSettings(data) {
        return this.settingsService.updateAiSettings(data.userId, data);
    }
    async resetAiSettings(userId) {
        return this.settingsService.resetAiSettings(userId);
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, common_1.Get)('platform-credentials'),
    __param(0, (0, common_1.Query)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPlatformCredentials", null);
__decorate([
    (0, common_1.Get)('platform-credentials/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getPlatformCredential", null);
__decorate([
    (0, common_1.Post)('platform-credentials'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "createPlatformCredential", null);
__decorate([
    (0, common_1.Put)('platform-credentials/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updatePlatformCredential", null);
__decorate([
    (0, common_1.Delete)('platform-credentials/:id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "deletePlatformCredential", null);
__decorate([
    (0, common_1.Post)('platform-credentials/:id/test'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "testPlatformConnection", null);
__decorate([
    (0, common_1.Get)('ai'),
    __param(0, (0, common_1.Query)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "getAiSettings", null);
__decorate([
    (0, common_1.Put)('ai'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "updateAiSettings", null);
__decorate([
    (0, common_1.Delete)('ai'),
    __param(0, (0, common_1.Query)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SettingsController.prototype, "resetAiSettings", null);
exports.SettingsController = SettingsController = __decorate([
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map