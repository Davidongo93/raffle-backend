import { NestFactory } from '@nestjs/core';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  // // Configuración de Swagger
  // const config = new DocumentBuilder()
  //   .setTitle('API de Usuarios')
  //   .setDescription('API para gestión de usuarios')
  //   .setVersion('1.0')
  //   .addBearerAuth(
  //     {
  //       type: 'http',
  //       scheme: 'bearer',
  //       bearerFormat: 'JWT',
  //       name: 'JWT',
  //       description: 'Ingrese el token JWT',
  //       in: 'header',
  //     },
  //     'JWT-auth', // Este nombre debe coincidir con el usado en @ApiBearerAuth()
  //   )
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document, {
  //   customSiteTitle: 'Documentación de API',
  //   customCss: `
  //     .topbar { background-color: #4a154b; }
  //     .swagger-ui .info { margin: 20px 0; }
  //   `,
  //   customfavIcon: 'https://nestjs.com/img/logo-small.svg',
  //   swaggerOptions: {
  //     persistAuthorization: true,
  //     docExpansion: 'none',
  //     filter: true,
  //     showRequestDuration: true,
  //   },
  // });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, Host, Origin, X-Requested-With',
    preflightContinue: false
  });

  // Sincronización de la base de datos
  const sequelize = app.select(AppModule).get(Sequelize);
  await sequelize.sync({ alter: false });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();