import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';

const server = express();

let nestApp: any;

async function bootstrapNest() {
  if (!nestApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server)
    );
    app.setGlobalPrefix('v1');
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Setup Swagger for Vercel Serverless environment
    const config = new DocumentBuilder()
      .setTitle('Wedding Space API')
      .setDescription('Realtime backend for Wedding Space MVP')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
      
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
    });

    await app.init();
    nestApp = app;
  }
}

export default async (req: any, res: any) => {
  await bootstrapNest();
  server(req, res);
};
