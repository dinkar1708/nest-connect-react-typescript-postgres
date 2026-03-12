import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

const parseExpiry = (val: string, defaultSec: number): number => {
  const v = val.toLowerCase();
  if (v.endsWith('h')) return parseInt(v, 10) * 3600 || defaultSec;
  if (v.endsWith('d')) return parseInt(v, 10) * 86400 || defaultSec;
  return parseInt(v, 10) || defaultSec;
};
const ACCESS_EXPIRES = parseExpiry(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h', 3600);
const REFRESH_EXPIRES = parseExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d', 604800);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateTokens(payload: { sub: string; email: string }) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_EXPIRES, // seconds
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: REFRESH_EXPIRES, // seconds
    });
    return { accessToken, refreshToken };
  }

  async signUp(dto: SignUpDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashed,
      },
    });
    const { accessToken, refreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { accessToken, refreshToken } = this.generateTokens({
      sub: user.id,
      email: user.email,
    });
    return {
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        refreshToken,
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const tokens = this.generateTokens({
        sub: user.id,
        email: user.email,
      });
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
