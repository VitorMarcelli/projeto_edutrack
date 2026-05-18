-- ==========================================
-- EduTrack AI - Modelagem de Dados Supabase
-- Autor: IA (Agent Backend Specialist)
-- ==========================================

-- Habilita a extensão para geração de UUIDs (padrão do Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TABELA DE DISCIPLINAS (subjects)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    professor TEXT,
    carga_horaria INTEGER, -- em horas
    descricao TEXT,
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adiciona índice para buscas rápidas pelo usuário
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON public.subjects(user_id);

-- ==========================================
-- 2. TABELA DE TAREFAS ACADÊMICAS (academic_tasks)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.academic_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_prevista DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
    tempo_estimado INTEGER, -- em minutos (usado pela Inteligência Artificial)
    tempo_real INTEGER, -- em minutos (usado pela Inteligência Artificial)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adiciona índice para buscas rápidas por disciplina
CREATE INDEX IF NOT EXISTS idx_academic_tasks_subject_id ON public.academic_tasks(subject_id);

-- ==========================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ==========================================
-- Função que atualiza a data automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para Disciplinas
CREATE TRIGGER trigger_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Trigger para Tarefas
CREATE TRIGGER trigger_academic_tasks_updated_at
BEFORE UPDATE ON public.academic_tasks
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ==========================================
-- 4. SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Isso garante que nenhum dado vaze para outro estudante

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_tasks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- Políticas para Disciplinas (subjects)
-- ------------------------------------------

-- SELECT: Ver apenas as próprias disciplinas
CREATE POLICY "Ver próprias disciplinas"
ON public.subjects FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Criar apenas disciplinas para si mesmo
CREATE POLICY "Inserir próprias disciplinas"
ON public.subjects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Atualizar apenas próprias disciplinas
CREATE POLICY "Atualizar próprias disciplinas"
ON public.subjects FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: Deletar apenas próprias disciplinas
CREATE POLICY "Deletar próprias disciplinas"
ON public.subjects FOR DELETE
USING (auth.uid() = user_id);


-- ------------------------------------------
-- Políticas para Tarefas (academic_tasks)
-- ------------------------------------------

-- SELECT: Ver tarefas apenas das disciplinas que pertencem a ele
CREATE POLICY "Ver tarefas de disciplinas próprias"
ON public.academic_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.subjects
    WHERE subjects.id = academic_tasks.subject_id
    AND subjects.user_id = auth.uid()
  )
);

-- INSERT: Inserir tarefas apenas em suas próprias disciplinas
CREATE POLICY "Inserir tarefas em disciplinas próprias"
ON public.academic_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.subjects
    WHERE subjects.id = subject_id
    AND subjects.user_id = auth.uid()
  )
);

-- UPDATE: Atualizar tarefas apenas em suas próprias disciplinas
CREATE POLICY "Atualizar tarefas de disciplinas próprias"
ON public.academic_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.subjects
    WHERE subjects.id = academic_tasks.subject_id
    AND subjects.user_id = auth.uid()
  )
);

-- DELETE: Deletar tarefas apenas de suas próprias disciplinas
CREATE POLICY "Deletar tarefas de disciplinas próprias"
ON public.academic_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.subjects
    WHERE subjects.id = academic_tasks.subject_id
    AND subjects.user_id = auth.uid()
  )
);
