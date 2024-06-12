import { ApiResponse, DTOKeys } from '@/types/index.type';
import { HttpStatus, Logger } from '@nestjs/common';

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
    console.log('checking key', key, keys[key], obj[key], typeof obj[key]);
    if (keys[key].required) {
      if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
        return false;
      }
    } else if (!keys[key].required && obj[key] !== undefined) {
      if (typeof keys[key].type === 'string') {
        if (keys[key].type === 'date') {
          console.log('checking date');
          if (isNaN(Date.parse(obj[key]))) {
            return false;
          }
        } else if (keys[key].type !== typeof obj[key]) {
          console.log('checking type', keys[key].type, typeof obj[key]);
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

export function safeObject(keys: DTOKeys, obj: any): unknown {
  const newObj: any = {};
  for (const key in keys) {
    if (obj[key] !== undefined) {
      if (keys[key].type === 'date') {
        newObj[key] = calibrateLocaltime(new Date(obj[key]));
      } else if (keys[key].type === 'number') {
        newObj[key] = parseInt(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
}

export function calibrateLocaltime(date: Date): Date {
  const offset = date.getTimezoneOffset();
  date.setMinutes(date.getMinutes() + offset);
  return date;
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

export function flattenObject(
  obj: any,
  options?: {
    include?: string[];
    exclude?: string[]; // ignored when include is provided
    alias?: { [key: string]: string }; // {target: alias}
  },
): unknown {
  const result: any = {};
  const recurse = (cur: any, prop: string) => {
    for (const key in cur) {
      const value = cur[key];
      if (
        value !== null &&
        typeof value === 'object' &&
        value.toString() === '[object Object]' &&
        !Array.isArray(value)
      ) {
        const nextProp = prop ? `${prop}.${key}` : key;
        recurse(value, nextProp);
      } else {
        result[prop ? `${prop}.${key}` : key] = value;
      }
    }
  };
  recurse(obj, '');
  if (options?.include !== undefined) {
    for (const key in result) {
      console.log(key, options.include.includes(key));
      if (!options.include.includes(key)) {
        delete result[key];
      }
    }
  } else {
    for (const key of options?.exclude || []) {
      delete result[key];
    }
  }
  for (const key in options?.alias || {}) {
    result[options.alias[key]] = result[key];
    delete result[key];
  }
  return result;
}
