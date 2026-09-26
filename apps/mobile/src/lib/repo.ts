import { createClient } from '@supabase/supabase-js';
import { createSampleRepository, createSupabaseRepository, type Repository } from '@core';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase 환경변수가 없으면 샘플 데이터로 동작합니다. */
export const usingSample = !url || !key;

export const repo: Repository = usingSample
  ? createSampleRepository()
  : createSupabaseRepository(createClient(url!, key!, { auth: { persistSession: false } }));
