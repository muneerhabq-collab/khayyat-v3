import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export const signIn = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
export const signUp = (email: string, password: string, fullName: string, shopName: string) => supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, shop_name: shopName } } });
export const signOut = () => supabase.auth.signOut();
