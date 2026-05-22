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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const performance_service_1 = require("./performance.service");
const performance_dto_1 = require("./dto/performance.dto");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
let PerformanceController = class PerformanceController {
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    create(dto) {
        return this.performanceService.create(dto);
    }
    getQueue(spaceId) {
        return this.performanceService.getQueue(spaceId);
    }
    updateStatus(id, dto) {
        return this.performanceService.updateStatus(id, dto);
    }
    reorder(spaceId, dto) {
        return this.performanceService.reorder(spaceId, dto);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [performance_dto_1.CreatePerformanceDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('queue/:spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "getQueue", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, performance_dto_1.UpdatePerformanceStatusDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':spaceId/reorder'),
    __param(0, (0, common_1.Param)('spaceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, performance_dto_1.ReorderPerformanceDto]),
    __metadata("design:returntype", void 0)
], PerformanceController.prototype, "reorder", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('performances'),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map