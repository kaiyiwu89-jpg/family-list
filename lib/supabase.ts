import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 调试用：如果在 Netlify 控制台看到这些是 undefined，就是变量没配置对
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase 变量丢失！请检查 Netlify 环境变量配置。");
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);