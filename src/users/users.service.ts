import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private sequelize: Sequelize
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userModel.create<User>(createUserDto);
    } catch (error: any) {
      console.error(error)
      if (error instanceof UniqueConstraintError) {
        const field = error.errors[0].path;
        throw new ConflictException(`El ${field} ya está registrado`);
      }
      if (error instanceof ValidationError) {
        throw new BadRequestException(`${error.message}`);
      }

      const errorMessage = typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message) : String(error);
      throw new InternalServerErrorException(`Al crear usuario: ${errorMessage}`);
    }

  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.findAll();
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener los usuarios: ${error}`);
    }
  }

  async findOne(id: string): Promise<User> {
    if (!id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      throw new BadRequestException('ID de usuario inválido');
    }

    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al obtener el usuario');
    }
  }
}