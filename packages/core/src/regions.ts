import data from './regions.json';
import { SIDO_CODE, type Region, type Sido } from './types';

export const REGIONS = data as Region[];

export function regionsOf(sido: Sido): Region[] {
  return REGIONS.filter((r) => r.sido === sido);
}

export function findRegion(code: string): Region | undefined {
  return REGIONS.find((r) => r.code === code);
}

/** '11' → 서울, '41' → 경기 */
export function sidoFromCode(code: string): Sido | undefined {
  return (Object.keys(SIDO_CODE) as Sido[]).find((s) => SIDO_CODE[s] === code);
}
