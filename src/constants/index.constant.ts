import { Paginate } from '@/types/index.type';

export const DEFAULT_PAGE_SIZE = 15;
export const EMPTY_PAGE: Paginate<unknown> = {
  meta: {
    pageNo: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPage: 0,
    totalCount: 0,
  },
  list: [],
};
