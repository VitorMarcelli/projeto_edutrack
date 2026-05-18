from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI(
    title="EduTrack AI - Microserviço",
    description="API inteligente para calcular progresso e gerar insights das disciplinas."
)

# Configuração de CORS para permitir que o navegador (React Native Web) acesse a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("⚠️  AVISO: SUPABASE_URL ou SUPABASE_KEY não encontrados no .env")

# Headers necessários para falar com a API REST do Supabase
headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Profile": "public"
}

# Schema de Resposta da API
class InsightsResponse(BaseModel):
    subject_id: str
    insights: str
    progresso_percentual: float
    total_tarefas: int
    tarefas_concluidas: int

@app.get("/")
def read_root():
    return {"status": "ok", "message": "EduTrack AI Microservice está rodando! 🚀"}

@app.get("/api/insights/{subject_id}", response_model=InsightsResponse)
async def get_insights(subject_id: str):
    """
    Busca todas as tarefas de uma disciplina no Supabase via REST API e gera os insights.
    """
    try:
        # Consulta direta via HTTP para contornar problemas de compilação da lib supabase-py no Windows
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{url}/rest/v1/academic_tasks?subject_id=eq.{subject_id}&select=*",
                headers=headers
            )
            response.raise_for_status()
            tasks = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao acessar banco de dados via REST: {str(e)}")
    
    if not tasks:
        return InsightsResponse(
            subject_id=subject_id,
            insights="Nenhuma tarefa encontrada para gerar insights.",
            progresso_percentual=0.0,
            total_tarefas=0,
            tarefas_concluidas=0
        )

    # Cálculo do Progresso Geral
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.get('status') == 'concluida')
    progresso = (completed_tasks / total_tasks) * 100

    # Lógica Inteligente (Insights de Tempo)
    tempo_estimado_total = sum(t.get('tempo_estimado') or 0 for t in tasks)
    tempo_real_total = sum(t.get('tempo_real') or 0 for t in tasks)

    insight_msg = f"Você concluiu {completed_tasks} de {total_tasks} tarefas. "
    
    if tempo_real_total > 0 and tempo_estimado_total > 0:
        if tempo_real_total > tempo_estimado_total * 1.3:
            insight_msg += "ALERTA: Você está levando 30% a mais de tempo do que o planejado. Reorganize seu cronograma."
        elif tempo_real_total < tempo_estimado_total * 0.8:
            insight_msg += "ÓTIMO: Você está concluindo as tarefas mais rápido que o previsto. Excelente foco!"
        else:
            insight_msg += "No Caminho Certo: Seu ritmo de estudos bate com o tempo planejado."
    else:
        insight_msg += "DICA: Adicione o 'tempo real' no futuro para receber análises comparativas da IA."

    return InsightsResponse(
        subject_id=subject_id,
        insights=insight_msg,
        progresso_percentual=round(progresso, 1),
        total_tarefas=total_tasks,
        tarefas_concluidas=completed_tasks
    )
