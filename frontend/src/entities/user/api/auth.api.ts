import { httpRequest } from '@/shared/api/http-client';
import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  User,
} from '../model/types';

export const authApi = {
  login(input: LoginInput): Promise<AuthSession> {
    return httpRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  register(input: RegisterInput): Promise<AuthSession> {
    return httpRequest<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  me(): Promise<{ user: User }> {
    return httpRequest<{ user: User }>('/auth/me');
  },
};
