-- Tabela de números da Ação Entre Amigos
CREATE TABLE IF NOT EXISTS public.rifa_numeros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'Disponivel'
    CHECK (status IN ('Disponivel', 'Reservado', 'Pago')),
  nome_comprador text,
  telefone text,
  vendedor text,
  forma_pagamento text
    CHECK (forma_pagamento IS NULL OR forma_pagamento IN ('PIX', 'Dinheiro')),
  data_venda timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rifa_numeros_status ON public.rifa_numeros (status);
CREATE INDEX IF NOT EXISTS idx_rifa_numeros_vendedor ON public.rifa_numeros (vendedor);
CREATE INDEX IF NOT EXISTS idx_rifa_numeros_nome_comprador ON public.rifa_numeros (nome_comprador);

ALTER TABLE public.rifa_numeros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de rifa_numeros"
  ON public.rifa_numeros
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir inserção pública de rifa_numeros"
  ON public.rifa_numeros
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de rifa_numeros"
  ON public.rifa_numeros
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.rifa_numeros IS 'Números da Ação Entre Amigos (1-500)';
