import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public')); // js, css, image
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // view

  app.setViewEngine('ejs');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // thêm whitelist thì khi update sẽ k bao h bị mất data
  }));

  // config cookies
  app.use(cookieParser());

  // config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ // default prefix "v"
    type: VersioningType.URI,
    defaultVersion: ['1'], // v1, v2
  });

  // config fix error cors
  app.enableCors(
    {
      "origin": true, // "*" => cho phép nơi nào đc phép kết nối // http://localhost:3000
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      credentials: true
     }
  );

  // config helmet
  app.use(helmet());

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('NestJS Document')
    .setDescription('All modules API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();
  const document = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    }
  });

  await app.listen(configService.get('PORT'));
}
bootstrap();
