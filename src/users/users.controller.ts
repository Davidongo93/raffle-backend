import { Body, Controller, Get, Param, Post } from '@nestjs/common';
// import {
//   ApiBadRequestResponse,
//   ApiConflictResponse,
//   ApiInternalServerErrorResponse,
//   ApiNotFoundResponse,
//   ApiOperation,
//   ApiResponse,
//   ApiTags
// } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';
import { UsersService } from './users.service';

// @ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  // @ApiOperation({ summary: 'Crear un nuevo usuario' })
  // @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado', type: User })
  // @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  // @ApiConflictResponse({ description: 'Conflicto de datos únicos (email/teléfono)' })
  // @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log('Received createUserDto:', createUserDto);

    return this.usersService.create(createUserDto);
  }

  @Get()
  // @ApiOperation({ summary: 'Obtener todos los usuarios' })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Lista de usuarios', type: [User] })
  // @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  // @ApiOperation({ summary: 'Obtener usuario por ID' })
  // @ApiResponse({ status: HttpStatus.OK, description: 'Usuario encontrado', type: User })
  // @ApiBadRequestResponse({ description: 'ID inválido' })
  // @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  // @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(id);
  }
}