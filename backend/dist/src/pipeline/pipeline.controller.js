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
exports.PipelineController = void 0;
const common_1 = require("@nestjs/common");
const pipeline_service_1 = require("./pipeline.service");
const client_1 = require("@prisma/client");
let PipelineController = class PipelineController {
    pipelineService;
    constructor(pipelineService) {
        this.pipelineService = pipelineService;
    }
    async getPipelineStatus() {
        return this.pipelineService.getPipelineStatus();
    }
    async createContent(body) {
        return this.pipelineService.createContent(body);
    }
    async getContentById(id) {
        return this.pipelineService.getContentById(id);
    }
    async updateContent(id, body) {
        return this.pipelineService.updateContent(id, body);
    }
    async deleteContent(id) {
        return this.pipelineService.deleteContent(id);
    }
    async updateContentStatus(id, body) {
        return this.pipelineService.updateContentStatus(id, body.status, body.userId);
    }
    async searchContents(query, status, authorId, topicId, startDate, endDate, page, limit) {
        return this.pipelineService.searchContents({
            query,
            status,
            authorId: authorId ? parseInt(authorId) : undefined,
            topicId: topicId ? parseInt(topicId) : undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
    }
};
exports.PipelineController = PipelineController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "getPipelineStatus", null);
__decorate([
    (0, common_1.Post)('content'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "createContent", null);
__decorate([
    (0, common_1.Get)('content/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "getContentById", null);
__decorate([
    (0, common_1.Put)('content/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "updateContent", null);
__decorate([
    (0, common_1.Delete)('content/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "deleteContent", null);
__decorate([
    (0, common_1.Patch)('content/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "updateContentStatus", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('authorId')),
    __param(3, (0, common_1.Query)('topicId')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PipelineController.prototype, "searchContents", null);
exports.PipelineController = PipelineController = __decorate([
    (0, common_1.Controller)('pipeline'),
    __metadata("design:paramtypes", [pipeline_service_1.PipelineService])
], PipelineController);
//# sourceMappingURL=pipeline.controller.js.map