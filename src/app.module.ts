import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MiddlewaresModule } from './middleware/middlewares.module';
import { RafflesModule } from './raffles/raffles.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

//sql script development database creation
// run psql in terminal: psql -U postgres
// then run the following commands:

// CREATE DATABASE raffle_db;
// CREATE USER raffle_user WITH ENCRYPTED PASSWORD 'password';
// GRANT ALL PRIVILEGES ON DATABASE raffle_db TO raffle_user;

const sequelizeEnvironment = process.env.NODE_ENV === 'production' ?
  SequelizeModule.forRootAsync({
    imports: [ConfigModule],

    useFactory: (configService: ConfigService) => ({
      dialect: 'postgres',
      host: configService.get<string>('DB_HOST'),
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
      autoLoadModels: true,
      synchronize: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        decimalNumbers: true,
      },
    }),
    inject: [ConfigService],
  }) : SequelizeModule.forRootAsync({
    imports: [ConfigModule],

    useFactory: () => ({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'raffle_user',
      password: 'password',
      database: 'raffle_db',
      autoLoadModels: true,
      synchronize: true,
      dialectOptions: {
        decimalNumbers: true, // Ensure decimal numbers are handled correctly
      },
    }),
    inject: [ConfigService],
  });

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    sequelizeEnvironment,
    MiddlewaresModule,
    UsersModule,
    RafflesModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
