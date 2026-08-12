import os
import threading
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


app = FastAPI(
    title="Bloco de Tarefas API",
    description="API para gerenciar tarefas",
    version="1.0.0",
)

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=str(frontend_dir)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


tarefas = []


class TarefaInput(BaseModel):
    titulo: str


def abrir_navegador():
    if hasattr(os, "startfile"):
        os.startfile("http://127.0.0.1:8000/")
    else:
        webbrowser.open("http://127.0.0.1:8000/")


@app.on_event("startup")
def iniciar():
    threading.Timer(1.0, abrir_navegador).start()


@app.get("/")
def inicio():
    return RedirectResponse(url="/static/index.html")


@app.get("/api")
def api_raiz():
    return {
        "mensagem": "Bem-vindo à API do Bloco de Tarefas!",
        "roteiro": "Use /api/tarefas para listar as tarefas.",
        "versao": "1.0.0",
    }


@app.get("/api/tarefas")
def listar_tarefas():
    return tarefas


@app.post("/api/tarefas", status_code=201)
def criar_tarefa(tarefa: TarefaInput):
    titulo = tarefa.titulo.strip()
    if not titulo:
        raise HTTPException(status_code=400, detail="O título não pode ficar vazio.")

    nova_tarefa = {
        "id": len(tarefas) + 1,
        "titulo": titulo,
        "concluida": False,
    }
    tarefas.append(nova_tarefa)
    return nova_tarefa


@app.delete("/api/tarefas/{tarefa_id}")
def deletar_tarefa(tarefa_id: int):
    for indice, tarefa in enumerate(tarefas):
        if tarefa["id"] == tarefa_id:
            tarefas.pop(indice)
            return {"mensagem": "Tarefa removida com sucesso"}

    raise HTTPException(status_code=404, detail="Tarefa não encontrada")

