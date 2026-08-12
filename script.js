function apiUrl(path) {
    const baseOrigin = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'http://127.0.0.1:8000/';

    return `${baseOrigin}${path.startsWith('/') ? path : `/${path}`}`;
}

async function carregarTarefas() {
    const listaElemento = document.getElementById('lista-tarefas');
    if (!listaElemento) return;

    try {
        const resposta = await fetch(apiUrl('/api/tarefas'));
        if (!resposta.ok) {
            throw new Error('Não foi possível carregar as tarefas.');
        }

        const tarefas = await resposta.json();
        listaElemento.innerHTML = '';

        if (!Array.isArray(tarefas) || tarefas.length === 0) {
            listaElemento.innerHTML = '<p>Nenhuma tarefa cadastrada.</p>';
            return;
        }

        tarefas.forEach((tarefa) => {
            const item = document.createElement('div');
            item.className = 'tarefa-item';
            item.style.margin = '10px 0';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.innerHTML = `
                <div>
                    <input type="checkbox" ${tarefa.concluida ? 'checked' : ''}>
                    <span class="${tarefa.concluida ? 'concluida' : ''}">${tarefa.titulo}</span>
                </div>
                <button type="button" data-id="${tarefa.id}" title="Excluir tarefa" style="border: none; background: transparent; color: red; cursor: pointer; font-size: 18px;">✕</button>
            `;
            listaElemento.appendChild(item);
        });

        listaElemento.querySelectorAll('button[data-id]').forEach((botao) => {
            botao.addEventListener('click', async () => {
                const id = botao.getAttribute('data-id');
                await deletarTarefa(id);
            });
        });
    } catch (erro) {
        console.error('Erro ao carregar tarefas:', erro);
        listaElemento.innerHTML = '<p>Erro ao carregar as tarefas.</p>';
    }
}

async function adicionarTarefa() {
    const inputElemento = document.getElementById('nova-tarefa-input');
    if (!inputElemento) return;

    const titulo = inputElemento.value.trim();
    if (!titulo) {
        alert('Por favor, digite uma tarefa!');
        return;
    }

    try {
        const resposta = await fetch(apiUrl('/api/tarefas'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo })
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.detail || 'Erro ao salvar a tarefa.');
        }

        inputElemento.value = '';
        await carregarTarefas();
    } catch (erro) {
        console.error('Erro ao adicionar tarefa:', erro);
        alert(erro.message);
    }
}

async function deletarTarefa(id) {
    try {
        const resposta = await fetch(apiUrl(`/api/tarefas/${id}`), {
            method: 'DELETE'
        });

        if (!resposta.ok) {
            const erro = await resposta.json().catch(() => ({}));
            throw new Error(erro.detail || 'Erro ao excluir a tarefa.');
        }

        await carregarTarefas();
    } catch (erro) {
        console.error('Erro ao excluir tarefa:', erro);
        alert(erro.message);
    }
}

window.adicionarTarefa = adicionarTarefa;
window.deletarTarefa = deletarTarefa;

document.addEventListener('DOMContentLoaded', () => {
    carregarTarefas();

    const inputElemento = document.getElementById('nova-tarefa-input');
    if (inputElemento) {
        inputElemento.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter') {
                adicionarTarefa();
            }
        });
    }
});


