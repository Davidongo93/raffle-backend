import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Raffle } from './raffles/raffle.model';
import { RafflesModule } from './raffles/raffles.module';
import { Ticket } from './tickets/ticket.model';
import { TicketsModule } from './tickets/tickets.module';
import { User } from './users/user.model';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        models: [User, Raffle, Ticket],
        autoLoadModels: true,
        synchronize: true,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false, // This is important for self-signed certificates
          },
          decimalNumbers: true, // Ensure decimal numbers are handled correctly
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    RafflesModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }