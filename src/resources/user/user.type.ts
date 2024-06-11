import { DTOKeys } from '@/types/index.type';

export const UserDTOKeys: DTOKeys = {
  name: {
    type: 'string',
    required: true,
  },
  sex: {
    type: ['m', 'f'],
    required: true,
  },
  nickname: {
    type: 'string',
    required: true,
  },
  id: {
    type: 'string',
    required: true,
  },
  pwd: {
    type: 'string',
    required: true,
  },
  teamName: {
    type: 'string',
    required: true,
  },
  profileImg: {
    type: 'string',
    required: false,
  },
  coverImg: {
    type: 'string',
    required: false,
  },
  introduce: {
    type: 'string',
    required: false,
  },
  dob: {
    type: 'date',
    required: true,
  },
  geo: {
    type: 'string',
    required: false,
  },
} as const;

export interface UserDTO {
  name: string;
  sex: 'm' | 'f';
  nickname: string;
  id: string;
  pwd: string;
  teamName: string;
  profileImg?: string;
  coverImg?: string;
  introduce?: string;
  dob: Date;
  geo: string;
}

export interface UserDAO extends UserDAOBase {
  teamName: string;
}

export interface UserDAOBase {
  id: number;
  ref: string;
  name: string;
  sex: number;
  age: number;
  dob: Date;
  nickname: string;
  authId: string;
  teamId: number;
  profileImg: string;
  coverImg: string;
  introduce: string;
  geo: string;
  actStatus: number;
  createdAt: Date;
  updatedAt: Date;
}

export const UserStatusKey = {
  BLOCK_ALL: 0,
  ALLOW_ALL: 1,
  BLOCK_POST: 2,
  BLOCK_GROUP: 3,
  BLOCK_CHAT: 4,
};

export type UserStatus = (typeof UserStatusKey)[keyof typeof UserStatusKey];
