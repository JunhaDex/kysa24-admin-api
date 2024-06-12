import { DTOKeys } from '@/types/index.type';

export const GroupDTOKeys: DTOKeys = {
  creatorRef: {
    type: 'string',
    required: true,
  },
  groupName: {
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
} as const;

export interface GroupDTO {
  creatorRef: string;
  groupName: string;
  profileImg?: string;
  coverImg?: string;
  introduce?: string;
}

export interface GroupDAO {
  id: number;
  ref: string;
  creator: number;
  creatorRef: string;
  creatorName: string;
  groupName: string;
  profileImg: string;
  coverImg: string;
  introduce: string;
  isShow: boolean;
  createdAt: Date;
  updatedAt: Date;
}
