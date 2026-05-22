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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async verify(body) {
        const result = await this.authService.verifyFirebaseToken(body.idToken);
        return {
            message: 'Authentication successful',
            user: result.user,
        };
    }
    async joinSpace(body, req) {
        const userId = req.user?.id || req.headers['x-user-id'];
        if (!userId) {
            throw new Error('User ID required in headers (x-user-id) or auth context');
        }
        const guest = await this.authService.joinSpace(userId, body.spaceId, body.name, body.group, body.relation);
        return {
            message: 'Joined space successfully',
            guest,
        };
    }
    async getSession(req) {
        const firebaseUid = req.user?.firebaseUid || req.headers['x-firebase-uid'];
        if (!firebaseUid) {
            throw new Error('Firebase UID required in headers (x-firebase-uid) or auth context');
        }
        const user = await this.authService.validateSession(firebaseUid);
        return {
            user,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('join-space'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.JoinSpaceDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "joinSpace", null);
__decorate([
    (0, common_1.Get)('session'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSession", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map