import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.model';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        return this.userModel.create<User>(createUserDto as any);
    }

    async findAll(): Promise<User[]> {
        return this.userModel.findAll();
    }

    async findOne(id: string): Promise<User | null> {
        if (!id) {
            throw new Error('User ID is required');
        }
        return this.userModel.findByPk(id);
    }
}