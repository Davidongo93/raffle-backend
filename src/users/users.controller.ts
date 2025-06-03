import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findOne(id);
    }
}