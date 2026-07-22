import { NotFoundException } from '@my-noodles/api-lib/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type FindOptionsWhere, Repository } from 'typeorm';

import { User } from './user.entity';

export class UserNotFoundException extends NotFoundException {
  static readonly sample = new UserNotFoundException();

  constructor() {
    super({
      code: 'user_not_found',
      message: 'User not found',
    });
  }
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async get(where: FindOptionsWhere<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    return await this.usersRepository.save(
      this.usersRepository.create({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
      }),
    );
  }
}
