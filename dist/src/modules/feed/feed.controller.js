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
exports.FeedController = void 0;
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
const feed_dto_1 = require("./dto/feed.dto");
const firebase_auth_guard_1 = require("../auth/guards/firebase-auth.guard");
const throttler_1 = require("@nestjs/throttler");
let FeedController = class FeedController {
    constructor(feedService) {
        this.feedService = feedService;
    }
    createPost(dto) {
        return this.feedService.createPost(dto);
    }
    getFeed(spaceId, cursor, limit) {
        return this.feedService.getFeed(spaceId, cursor, limit ? +limit : 20);
    }
    getTrending(spaceId) {
        return this.feedService.getTrending(spaceId);
    }
    addReaction(dto) {
        return this.feedService.addReaction(dto);
    }
    removeReaction(postId, guestId, emoji) {
        return this.feedService.removeReaction(postId, guestId, emoji);
    }
    addComment(dto) {
        return this.feedService.addComment(dto);
    }
    getComments(postId, limit) {
        return this.feedService.getComments(postId, limit ? +limit : 50);
    }
};
exports.FeedController = FeedController;
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feed_dto_1.CreateFeedPostDto]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)(':spaceId'),
    __param(0, (0, common_1.Param)('spaceId')),
    __param(1, (0, common_1.Query)('cursor')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)(':spaceId/trending'),
    __param(0, (0, common_1.Param)('spaceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "getTrending", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 10000 } }),
    (0, common_1.Post)('react'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feed_dto_1.CreateReactionDto]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Delete)(':postId/react'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('guestId')),
    __param(2, (0, common_1.Query)('emoji')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "removeReaction", null);
__decorate([
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    (0, common_1.Post)('comment'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feed_dto_1.CreateCommentDto]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':postId/comments'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FeedController.prototype, "getComments", null);
exports.FeedController = FeedController = __decorate([
    (0, common_1.UseGuards)(firebase_auth_guard_1.FirebaseAuthGuard, throttler_1.ThrottlerGuard),
    (0, common_1.Controller)('feed'),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedController);
//# sourceMappingURL=feed.controller.js.map