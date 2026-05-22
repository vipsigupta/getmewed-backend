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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const device_dto_1 = require("./dto/device.dto");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
const throttler_1 = require("@nestjs/throttler");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    registerDevice(dto) {
        return this.notificationService.registerDevice(dto);
    }
    removeDevice(dto) {
        return this.notificationService.removeDevice(dto);
    }
    getGuestDevices(guestId) {
        return this.notificationService.getGuestDevices(guestId);
    }
    broadcast(dto) {
        return this.notificationService.broadcast(dto);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('devices/register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_dto_1.RegisterDeviceDto]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "registerDevice", null);
__decorate([
    (0, common_1.Delete)('devices/remove'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [device_dto_1.RemoveDeviceDto]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "removeDevice", null);
__decorate([
    (0, common_1.Get)('devices/:guestId'),
    __param(0, (0, common_1.Param)('guestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "getGuestDevices", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_service_1.BroadcastDto]),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "broadcast", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, throttler_1.ThrottlerGuard),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map