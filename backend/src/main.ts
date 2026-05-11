import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Permite requisições do frontend (dev e produção)
  app.enableCors({
    origin: [
      'http://localhost:5173',   // Vite dev server
      'http://localhost:4173',   // Vite preview
      process.env.FRONTEND_URL, // URL de produção (defina no .env)
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
