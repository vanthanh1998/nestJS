import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TransformInterceptor } from './core/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  app.useStaticAssets(join(__dirname, '..', 'public')); // js, css, image
  app.setBaseViewsDir(join(__dirname, '..', 'views')); // view

  app.setViewEngine('ejs');

  app.useGlobalPipes(new ValidationPipe());

  // config versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({ // default prefix "v"
    type: VersioningType.URI,
    defaultVersion: ['1', '2'], // v1, v2
  });

  //config fix error cors
  app.enableCors(
    {
      "origin": "*", // cho phép nơi nào đc phép kết nối // http://localhost:3000
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
     }
  );

  await app.listen(configService.get('PORT'));
}
bootstrap();
