import bcrypt from 'bcryptjs';
import { PublicUser, toPublicUser } from '../../domain/entities/user.entity';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/errors/domain.error';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { env } from '../../infrastructure/config/env';
import { LoginUserDTO, RegisterUserDTO } from '../dtos/auth.dto';
import { signAuthToken } from '../services/jwt.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export class AuthUseCases {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(input: RegisterUserDTO): Promise<AuthResponse> {
    const nombre =
      typeof input.nombre === 'string' ? input.nombre.trim() : '';
    const email =
      typeof input.email === 'string'
        ? input.email.trim().toLowerCase()
        : '';
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (nombre.length < 2) {
      throw new ValidationError(
        'Ingresa tu nombre completo (mínimo 2 caracteres).',
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new ValidationError(
        'Ingresa un correo electrónico con formato válido.',
      );
    }

    if (password.length < 6) {
      throw new ValidationError(
        'La contraseña debe tener al menos 6 caracteres.',
      );
    }

    const existente = await this.userRepository.findByEmail(email);
    if (existente) {
      throw new ConflictError(
        `Ya existe una cuenta registrada con el correo "${email}".`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const creado = await this.userRepository.create({
      nombre,
      email,
      password: hashedPassword,
      role: 'USER',
    });

    const user = toPublicUser(creado);
    const token = signAuthToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    return { token, user };
  }

  async login(input: LoginUserDTO): Promise<AuthResponse> {
    const email =
      typeof input.email === 'string'
        ? input.email.trim().toLowerCase()
        : '';
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (!email || !password) {
      throw new ValidationError(
        'Ingresa tu correo electrónico y contraseña.',
      );
    }

    const encontrado = await this.userRepository.findByEmail(email);
    if (!encontrado) {
      throw new UnauthorizedError('Correo electrónico o contraseña incorrectos.');
    }

    const passwordValido = await bcrypt.compare(password, encontrado.password);
    if (!passwordValido) {
      throw new UnauthorizedError('Correo electrónico o contraseña incorrectos.');
    }

    const user = toPublicUser(encontrado);
    const token = signAuthToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role,
    });

    return { token, user };
  }

  async getMe(userId: number): Promise<PublicUser> {
    const encontrado = await this.userRepository.findById(userId);
    if (!encontrado) {
      throw new NotFoundError('La cuenta de usuario ya no existe.');
    }
    return toPublicUser(encontrado);
  }

  async ensureDefaultAdmin(): Promise<PublicUser> {
    const email = env.ADMIN_EMAIL.trim().toLowerCase();
    const existente = await this.userRepository.findByEmail(email);

    if (existente) {
      return toPublicUser(existente);
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    const admin = await this.userRepository.create({
      nombre: env.ADMIN_NAME.trim() || 'Administrador General',
      email,
      password: hashedPassword,
      role: 'ADMIN',
    });

    return toPublicUser(admin);
  }
}
