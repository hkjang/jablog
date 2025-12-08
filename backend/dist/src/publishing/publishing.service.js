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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishingService = void 0;
const common_1 = require("@nestjs/common");
const wordpress_service_1 = require("./wordpress.service");
const tistory_service_1 = require("./tistory.service");
let PublishingService = class PublishingService {
    wpService;
    tistoryService;
    constructor(wpService, tistoryService) {
        this.wpService = wpService;
        this.tistoryService = tistoryService;
    }
    async publishToAll(title, content) {
        const results = [];
        try {
            const wp = await this.wpService.createPost(title, content);
            if (wp)
                results.push(wp);
        }
        catch (e) {
            console.error(e);
        }
        try {
            const tistory = await this.tistoryService.createPost(title, content);
            if (tistory)
                results.push(tistory);
        }
        catch (e) {
            console.error(e);
        }
        return results;
    }
};
exports.PublishingService = PublishingService;
exports.PublishingService = PublishingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [wordpress_service_1.WordpressService,
        tistory_service_1.TistoryService])
], PublishingService);
//# sourceMappingURL=publishing.service.js.map