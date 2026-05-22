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
exports.EventController = void 0;
const common_1 = require("@nestjs/common");
const event_service_1 = require("./event.service");
const event_dto_1 = require("./dto/event.dto");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
let EventController = class EventController {
    constructor(eventService) {
        this.eventService = eventService;
    }
    createEvent(dto) {
        return this.eventService.createEvent(dto);
    }
    getEvents(spaceId) {
        return this.eventService.getEvents(spaceId);
    }
    updateStatus(id, dto) {
        return this.eventService.updateEventStatus(id, dto);
    }
    markArrival(dto) {
        return this.eventService.markArrival(dto);
    }
};
exports.EventController = EventController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)('space/:spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, event_dto_1.UpdateEventStatusDto]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('arrival'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [event_dto_1.MarkArrivalDto]),
    __metadata("design:returntype", void 0)
], EventController.prototype, "markArrival", null);
exports.EventController = EventController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_service_1.EventService])
], EventController);
//# sourceMappingURL=event.controller.js.map