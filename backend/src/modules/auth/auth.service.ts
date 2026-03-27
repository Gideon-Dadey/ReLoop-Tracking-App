import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, userName, role, organizationId } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      passwordHash,
      userName,
      role: role ?? UserRole.USER,
      organizationId: organizationId ? new Types.ObjectId(organizationId) : null,
    });

    await newUser.save();

    return this.login({ email, password });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user._id, 
      email: user.email, 
      role: user.role, 
      organizationId: user.organizationId?._id || user.organizationId || null,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { 
      expiresIn: '7d', // Different secret would be better for refresh tokens but for MVP this is okay
    });

    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
        organizationId: user.organizationId,
        impact: user.impact,
        points: user.points,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  async updateProfile(userId: string, update: { userName?: string, avatar?: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');
    
    if (update.userName) user.userName = update.userName;
    if (update.avatar !== undefined) user.avatar = update.avatar;
    
    await user.save();
    return user;
  }

  async changePassword(userId: string, changeDto: { currentPassword: string, newPassword: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(changeDto.currentPassword, user.passwordHash);
    if (!isMatch) throw new Error('Incorrect current password');

    user.passwordHash = await bcrypt.hash(changeDto.newPassword, 10);
    await user.save();
    return { message: 'Password changed successfully' };
  }

  async validateUser(payload: any) {
    return this.userModel.findById(payload.sub).exec();
  }
}
