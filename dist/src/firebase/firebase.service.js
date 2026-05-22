"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
        this.initialized = false;
    }
    onModuleInit() {
        if (admin.apps.length > 0) {
            this.initialized = true;
            return;
        }
        try {
            const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!raw) {
                this.logger.warn('FIREBASE_SERVICE_ACCOUNT not set — FCM push disabled');
                return;
            }
            const serviceAccount = JSON.parse(raw);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            this.initialized = true;
            this.logger.log(`Firebase Admin initialized for project: ${serviceAccount.project_id}`);
        }
        catch (e) {
            this.logger.error('Failed to initialize Firebase Admin SDK', e);
        }
    }
    async sendMulticast(tokens, title, body, data) {
        if (!this.initialized || tokens.length === 0)
            return;
        const CHUNK = 500;
        const messaging = admin.messaging();
        for (let i = 0; i < tokens.length; i += CHUNK) {
            const chunk = tokens.slice(i, i + CHUNK);
            try {
                const response = await messaging.sendEachForMulticast({
                    tokens: chunk,
                    notification: { title, body },
                    data: data || {},
                    android: {
                        priority: 'high',
                        notification: { sound: 'default' },
                    },
                    apns: {
                        payload: {
                            aps: { sound: 'default', badge: 1 },
                        },
                    },
                });
                this.logger.log(`FCM sent: ${response.successCount} success, ${response.failureCount} failed`);
            }
            catch (err) {
                this.logger.error('FCM multicast error', err);
            }
        }
    }
    async verifyIdToken(idToken) {
        if (!this.initialized)
            throw new Error('Firebase Admin not initialized');
        return admin.auth().verifyIdToken(idToken);
    }
    isReady() {
        return this.initialized;
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map