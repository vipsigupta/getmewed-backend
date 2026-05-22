"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedServer;
async function bootstrap() {
    if (cachedServer) {
        return cachedServer;
    }
    const expressApp = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
        logger: ['error', 'warn', 'log'],
    });
    app.setGlobalPrefix('v1');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Wedding Space API')
        .setDescription('Realtime backend for Wedding Space MVP')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.init();
    cachedServer = (0, serverless_express_1.default)({ app: expressApp });
    return cachedServer;
}
const handler = async (event, context, callback) => {
    try {
        const server = await bootstrap();
        return server(event, context, callback);
    }
    catch (error) {
        console.error('Serverless bootstrap error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=serverless.js.map