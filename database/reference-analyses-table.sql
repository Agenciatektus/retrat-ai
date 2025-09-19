-- Tabela para armazenar análises de referências fotográficas
CREATE TABLE IF NOT EXISTS reference_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis JSONB NOT NULL,
  master_prompt TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  user_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_reference_analyses_project_id ON reference_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_reference_analyses_user_id ON reference_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_reference_analyses_created_at ON reference_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reference_analyses_confidence ON reference_analyses(confidence_score DESC);

-- RLS (Row Level Security)
ALTER TABLE reference_analyses ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias análises
CREATE POLICY "Users can view their own reference analyses"
  ON reference_analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Política para usuários criarem análises em seus próprios projetos
CREATE POLICY "Users can create reference analyses for their projects"
  ON reference_analyses FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = reference_analyses.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Política para usuários atualizarem suas próprias análises
CREATE POLICY "Users can update their own reference analyses"
  ON reference_analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias análises
CREATE POLICY "Users can delete their own reference analyses"
  ON reference_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_reference_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER reference_analyses_updated_at
  BEFORE UPDATE ON reference_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_reference_analyses_updated_at();
