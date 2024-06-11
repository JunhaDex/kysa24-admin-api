import { ApiResponse, DTOKeys } from '@/types/index.type';
import { HttpStatus, Logger } from '@nestjs/common';

export function validateObject(keys: string[], obj: any): boolean {
  for (const key of keys as string[]) {
    if (!obj[key]) {
      return false;
    }
  }
  return true;
}

export function cleanFilter(obj: any, keys: string[]): any {
  const cleaned: any = {};
  for (const key of keys) {
    if (key.includes('-')) {
      // snake to camel
      const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      cleaned[camelKey] = obj[key];
    } else {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export function validateBody(keys: DTOKeys, obj: any): boolean {
  for (const key in keys) {
    if (keys[key].required && !obj[key]) {
      return false;
    }
    if (typeof keys[key].type === 'string') {
      if (keys[key].type !== typeof obj[key]) {
        return false;
      }
    } else {
      if (!keys[key].type.includes(obj[key])) {
        return false;
      }
    }
    if (keys[key].length && obj[key].length > keys[key].length) {
      return false;
    }
    if (keys[key].limit && obj[key] > keys[key].limit) {
      return false;
    }
    if (keys[key].include && !keys[key].include.includes(obj[key])) {
      return false;
    }
    if (keys[key].exclude && keys[key].exclude.includes(obj[key])) {
      return false;
    }
  }
  return true;
}

export function fallbackCatch(e: any, res: any) {
  Logger.error(e);
  return res
    .code(HttpStatus.INTERNAL_SERVER_ERROR)
    .send(
      formatResponse(HttpStatus.INTERNAL_SERVER_ERROR, 'internal server error'),
    );
}

export function safeObject(
  keys: { key: string; type: string }[],
  obj: any,
): unknown {
  const newObj: any = { ...obj };
  for (const { key, type } of keys) {
    if (!obj[key]) {
      if (type === 'string') {
        newObj[key] = '';
      } else if (type === 'number') {
        newObj[key] = 0;
      } else if (type === 'boolean') {
        newObj[key] = false;
      } else if (type === 'array') {
        newObj[key] = [];
      } else if (type === 'object') {
        newObj[key] = {};
      }
    }
  }
  return newObj;
}

export function formatResponse(code: number, result: any): ApiResponse {
  let message = '';
  if (code >= 200 && code < 300) {
    message = 'ok';
  } else if (code === 400) {
    message = 'bad request';
  } else if (code === 401) {
    message = 'unauthorized';
  } else if (code === 403) {
    message = 'forbidden';
  } else if (code === 404) {
    message = 'not found';
  } else if (code === 500) {
    message = 'internal server error';
  } else {
    message = 'somewhat';
  }
  return {
    code,
    message,
    result,
  };
}
