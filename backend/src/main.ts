import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Diagnostic logs to help debug env loading during deploy/start
  console.log('Starting app - CWD=', process.cwd());
  console.log('SUPABASE_URL=', process.env.SUPABASE_URL);

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  // Permite requisições do frontend (dev e produção)
  app.enableCors({
    origin: [
      'http://localhost:5173',   // Vite dev server
      'http://localhost:4173',   // Vite preview
      process.env.FRONTEND_URL, // URL de produção (defina no .env)
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Igreja API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
