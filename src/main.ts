import { NestFactory } from '@nestjs/core';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Permitir todas las solicitudes CORS por defecto
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, Host, Origin, X-Requested-With',
    preflightContinue: true,
  });
  // Sincronización de la base de datos
  const sequelize = app.select(AppModule).get(Sequelize);
  await sequelize.sync({ alter: false });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
