import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/schemas/user.schema';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { ContainersService } from '../containers/containers.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private containersService: ContainersService,
  ) {}

  private sanitizeUser(user: any, extras: Record<string, any> = {}) {
    return {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      organizationId: user.organizationId,
      impact: user.impact,
      points: user.points,
      streakCount: user.streakCount,
      lastReturnAt: user.lastReturnAt,
      avatar: user.avatar,
      createdAt: user.createdAt,
      ...extras,
    };
  }

  private buildPayload(user: any) {
    return {
      sub: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId?._id || user.organizationId || null,
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, userName, role, organizationId } = registerDto;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = new this.userModel({
      email: normalizedEmail,
      passwordHash,
      userName,
      role: role ?? UserRole.USER,
      organizationId: organizationId ? new Types.ObjectId(organizationId) : null,
    });

    await newUser.save();
    return this.login({ email: normalizedEmail, password });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() }).select('+refreshToken');

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = this.buildPayload(user);

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    } as any);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    const weeklyGoal = await this.containersService.getWeeklyGoal(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user, { weeklyGoal }),
    };
  }

  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findById(payload.sub).select('+refreshToken');
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const newPayload = this.buildPayload(user);
    const newAccessToken = this.jwtService.sign(newPayload);
    const newRefreshToken = this.jwtService.sign(newPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    } as any);

    user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
    await user.save();

    const weeklyGoal = await this.containersService.getWeeklyGoal(user._id.toString());

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: this.sanitizeUser(user, { weeklyGoal }),
    };
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const weeklyGoal = await this.containersService.getWeeklyGoal(user._id.toString());
    const borrows = await this.containersService.getActiveBorrows(user._id.toString());

    return this.sanitizeUser(user, { weeklyGoal, activeBorrows: borrows.length });
  }

  async updateProfile(userId: string, update: { userName?: string; avatar?: string | null }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (update.userName) user.userName = update.userName;
    if (update.avatar !== undefined) user.avatar = update.avatar || null;

    await user.save();
    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, changeDto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(changeDto.currentPassword, user.passwordHash);
    if (!isMatch) throw new BadRequestException('Incorrect current password');

    user.passwordHash = await bcrypt.hash(changeDto.newPassword, 12);
    await user.save();
    return { message: 'Password changed successfully' };
  }

  async validateUser(payload: any) {
    return this.userModel.findById(payload.sub).exec();
  }
}
