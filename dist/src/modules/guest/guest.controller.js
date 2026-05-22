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
exports.GuestController = void 0;
const common_1 = require("@nestjs/common");
const guest_service_1 = require("./guest.service");
const participation_dto_1 = require("./dto/participation.dto");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
let GuestController = class GuestController {
    constructor(guestService) {
        this.guestService = guestService;
    }
    joinSpace(dto, req) {
        const userId = req.user.id;
        return this.guestService.joinSpace(userId, dto);
    }
    updateParticipation(guestId, dto) {
        return this.guestService.updateParticipation(guestId, dto);
    }
    leaveSpace(spaceId, req) {
        const userId = req.user.id;
        return this.guestService.leaveSpace(userId, spaceId);
    }
    getGuest(guestId) {
        return this.guestService.getGuest(guestId);
    }
};
exports.GuestController = GuestController;
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [participation_dto_1.JoinSpaceDto, Object]),
    __metadata("design:returntype", void 0)
], GuestController.prototype, "joinSpace", null);
__decorate([
    (0, common_1.Patch)(':guestId'),
    __param(0, (0, common_1.Param)('guestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, participation_dto_1.UpdateParticipationDto]),
    __metadata("design:returntype", void 0)
], GuestController.prototype, "updateParticipation", null);
__decorate([
    (0, common_1.Delete)('leave/:spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GuestController.prototype, "leaveSpace", null);
__decorate([
    (0, common_1.Get)(':guestId'),
    __param(0, (0, common_1.Param)('guestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GuestController.prototype, "getGuest", null);
exports.GuestController = GuestController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('guests'),
    __metadata("design:paramtypes", [guest_service_1.GuestService])
], GuestController);
//# sourceMappingURL=guest.controller.js.map