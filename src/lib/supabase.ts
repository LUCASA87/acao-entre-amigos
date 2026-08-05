import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const CAMPANHA_NOME =
  import.meta.env.VITE_CAMPANHA_NOME || 'Ação Entre Amigos'

export const VALOR_NUMERO = Number(import.meta.env.VITE_VALOR_NUMERO || 10)
