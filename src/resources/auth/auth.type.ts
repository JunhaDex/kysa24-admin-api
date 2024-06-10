import { DTOKeys } from '@/types/index.type';

export const AdminDTOKeys: DTOKeys = {
  loginId: {
    type: 'string',
    required: true,
  },
  pwd: {
    type: 'string',
    required: true,
  },
  name: {
    type: 'string',
    required: true,
  },
} as const;

export interface AdminDTO {
  loginId: string;
  pwd: string;
  name: string;
}

export const LoginDTOKeys: DTOKeys = {
  userId: {
    type: 'string',
    required: true,
  },
  password: {
    type: 'string',
    required: true,
  },
} as const;

export interface LoginDTO {
  userId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}
