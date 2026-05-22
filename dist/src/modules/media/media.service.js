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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
const BUCKET_NAME = 'space-media';
const UPLOAD_URL_EXPIRY = 300;
let MediaService = class MediaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getUploadUrl(filename, type, spaceId, guestId) {
        const ext = filename.split('.').pop() || 'bin';
        const supabaseRef = `${spaceId}/${guestId}/${(0, uuid_1.v4)()}.${ext}`;
        const { data, error } = await this.supabase.storage
            .from(BUCKET_NAME)
            .createSignedUploadUrl(supabaseRef);
        if (error)
            throw new Error(`Supabase storage error: ${error.message}`);
        const { data: publicData } = this.supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(supabaseRef);
        const media = await this.prisma.media.create({
            data: {
                type,
                url: publicData.publicUrl,
                supabaseRef,
                spaceId,
                guestId,
            },
        });
        return {
            mediaId: media.id,
            uploadUrl: data.signedUrl,
            publicUrl: publicData.publicUrl,
            expiresIn: UPLOAD_URL_EXPIRY,
        };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map