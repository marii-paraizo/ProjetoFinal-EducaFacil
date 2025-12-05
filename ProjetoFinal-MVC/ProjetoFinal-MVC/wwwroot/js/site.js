document.addEventListener('DOMContentLoaded', function () {

    /* ------------------ Lógica de TURMAS ----------------- */

    const modalOverlayTurma = document.getElementById('modalExclusao');
    const nomeTurmaSpan = document.getElementById('nomeTurmaExcluir');
    const btnConfirmar = document.getElementById('btn-excluir-confirmar');
    const btnCancelar = document.getElementById('btn-excluir-cancelar');

    const baseApiUrlTurmas_Listagem = 'https://localhost:7126/api/Turmas';
    let turmaIdParaExcluir = null;

    function fecharModalTurma() {
        const modalContent = document.querySelector('#modalExclusao .modal-confirmacao');
        if (modalContent) modalContent.classList.remove('ativo');
        setTimeout(() => {
            if (modalOverlayTurma) modalOverlayTurma.style.display = 'none';
        }, 300);
        turmaIdParaExcluir = null;
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async function () {
            if (turmaIdParaExcluir) {
                try {
                    const response = await fetch(`${baseApiUrlTurmas_Listagem}/${turmaIdParaExcluir}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok || response.status === 204) {
                        const cardParaRemover = document.querySelector(`.card-turma[data-id="${turmaIdParaExcluir}"]`);
                        if (cardParaRemover) {
                            cardParaRemover.style.opacity = 0;
                            setTimeout(() => {
                                cardParaRemover.remove();
                                fecharModalTurma();
                            }, 300);
                        }
                    } else {
                        alert(`Erro ao excluir a turma. Código: ${response.status}`);
                        fecharModalTurma();
                    }
                } catch (error) {
                    alert('Erro de conexão ao excluir a turma.');
                    fecharModalTurma();
                }
            }
        });
    }

    if (btnCancelar) btnCancelar.addEventListener('click', fecharModalTurma);
    if (modalOverlayTurma) {
        modalOverlayTurma.addEventListener('click', function (e) {
            if (e.target === modalOverlayTurma) fecharModalTurma();
        });
    }

    /* ------------------ Lógica de ALUNOS ----------------- */

    // Clique na Linha da Tabela (Alunos)

    document.querySelectorAll('.linha-aluno-clicavel').forEach(row => {
        row.addEventListener('click', function (event) {
            if (event.target.tagName !== 'A' && event.target.tagName !== 'BUTTON') {
                const href = this.getAttribute('data-href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });

    // Impede que o clique nos botões (Editar/Apagar) dispare o clique na linha
    document.querySelectorAll('.btn-apagar, .btn-editar').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    });

    // Exclusão de Aluno
    const modalOverlayAluno = document.getElementById('modalExclusaoAluno');
    const btnApagarAluno = document.querySelectorAll('.btn-apagar-aluno');
    const nomeAlunoSpan = document.getElementById('nomeAlunoExcluir');
    const btnConfirmarAluno = document.getElementById('btn-excluir-aluno-confirmar');
    const btnCancelarAluno = document.getElementById('btn-excluir-aluno-cancelar');

    const scriptTagAlunoApi = document.querySelector('script[data-api-url]');
    const baseApiUrlAluno = scriptTagAlunoApi ? scriptTagAlunoApi.getAttribute('data-api-url') : '/api/Alunos';

    let alunoIdParaExcluir = null;

    if (modalOverlayAluno && btnApagarAluno.length > 0) {

        function fecharModalAluno() {
            const modalContent = document.querySelector('#modalExclusaoAluno .modal-confirmacao');
            if (modalContent) modalContent.classList.remove('ativo');
            setTimeout(() => {
                if (modalOverlayAluno) modalOverlayAluno.style.display = 'none';
            }, 300);
            alunoIdParaExcluir = null;
        }

        btnApagarAluno.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                alunoIdParaExcluir = this.getAttribute('data-aluno-id');
                const nomeAluno = this.getAttribute('data-aluno-nome');

                nomeAlunoSpan.textContent = nomeAluno;
                modalOverlayAluno.style.display = 'flex';
                setTimeout(() => document.querySelector('#modalExclusaoAluno .modal-confirmacao').classList.add('ativo'), 10);
            });
        });

        btnCancelarAluno.addEventListener('click', fecharModalAluno);
        modalOverlayAluno.addEventListener('click', function (e) {
            if (e.target === modalOverlayAluno) {
                fecharModalAluno();
            }
        });

        // Ação de Exclusão de Aluno (Fetch DELETE)
        btnConfirmarAluno.addEventListener('click', async function () {
            if (alunoIdParaExcluir) {
                const urlDelete = `${baseApiUrlAluno}/${alunoIdParaExcluir}`;

                try {
                    const response = await fetch(urlDelete, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (response.ok || response.status === 204) {
                        const linhaParaRemover = document.querySelector(`tr[data-href*="${alunoIdParaExcluir}"]`);
                        if (linhaParaRemover) {
                            linhaParaRemover.style.opacity = 0;
                            linhaParaRemover.style.transform = 'scale(0.8)';
                            setTimeout(() => {
                                linhaParaRemover.remove();
                                fecharModalAluno();
                            }, 300);
                        }
                    } else {
                        alert(`Falha ao excluir o aluno. A API retornou o código: ${response.status}.`);
                        fecharModalAluno();
                    }
                } catch (error) {
                    console.error("Erro na requisição DELETE:", error);
                    alert('Erro de conexão com o servidor ao excluir o aluno.');
                    fecharModalAluno();
                }
            }
        });
    }

    /* ----------------- Lógica da Página de NOTAS ----------------- */
    const btnSelecionar = document.getElementById('btn-selecionar-avaliacoes');
    const btnCalcularMedia = document.getElementById('btn-calcular-media');
    const btnExcluirSelecionadas = document.getElementById('btn-excluir-selecionadas');
    const btnCancelarSelecao = document.getElementById('btn-cancelar-selecao');
    const listaNotas = document.getElementById('lista-notas');
    const acoesRodape = document.getElementById('acoes-notas-rodape');
    const mediaDisplay = document.getElementById('media-aluno-display');
    const modalOverlayNotas = document.getElementById('modalExclusaoNotas');
    const btnConfirmarExclusao = document.getElementById('btn-excluir-notas-confirmar');
    const btnCancelarModal = document.getElementById('btn-excluir-notas-cancelar');
    const contagemNotasExcluir = document.getElementById('contagem-notas-excluir');

    let modoSelecaoAtivo = false;

    const scriptTagNotas = document.querySelector('script[data-notas-api-url]');
    const baseApiUrlNotas = scriptTagNotas ? scriptTagNotas.getAttribute('data-notas-api-url') : null;
    const idAlunoNotas = scriptTagNotas ? scriptTagNotas.getAttribute('data-aluno-id') : null;


    if (baseApiUrlNotas && idAlunoNotas) {

        function fecharModalNotas() {
            if (modalOverlayNotas) modalOverlayNotas.style.display = 'none';
        }

        function toggleModoSelecao(ativo) {
            modoSelecaoAtivo = ativo;
            listaNotas.classList.toggle('modo-selecao-ativo', ativo);

            btnSelecionar.style.display = ativo ? 'none' : 'inline-block';

            acoesRodape.style.display = ativo ? 'flex' : 'none';

            if (!ativo) {
                listaNotas.querySelectorAll('.nota-checkbox').forEach(cb => {
                    cb.checked = false;
                    const card = cb.closest('.card-nota');
                    if (card) card.classList.remove('selecionado');
                });
                if (mediaDisplay) mediaDisplay.innerHTML = '--.-- <span class="unidade">/ 10</span>';
            }
        }

        // aplicar a classe e recalcular a média
        function atualizarSelecao(checkbox) {
            const card = checkbox.closest('.card-nota');
            if (card) {
                card.classList.toggle('selecionado', checkbox.checked);
            }
            recalcularMedia();
        }

        function recalcularMedia() {
            const notasSelecionadas = listaNotas.querySelectorAll('.nota-checkbox:checked');

            if (notasSelecionadas.length === 0) {
                mediaDisplay.innerHTML = '--.-- <span class="unidade">/ 10</span>';
                return;
            }

            let soma = 0;
            notasSelecionadas.forEach(cb => {
                let notaStr = cb.getAttribute('data-nota-valor').replace(',', '.').trim();

                const nota = parseFloat(notaStr);

                if (isNaN(nota)) {
                    console.error(`Nota inválida ou ausente no cálculo: "${notaStr}".`);
                    return;
                }
                soma += nota;
            });

            const media = soma / notasSelecionadas.length;

            const mediaFormatada = media.toFixed(2);

            mediaDisplay.innerHTML = `${mediaFormatada} <span class="unidade">/ 10</span>`;
        }


        // Listeners de Eventos (Notas)

        if (btnSelecionar) {
            btnSelecionar.addEventListener('click', () => toggleModoSelecao(true));
        }
        if (btnCancelarSelecao) {
            btnCancelarSelecao.addEventListener('click', () => toggleModoSelecao(false));
        }

        if (listaNotas) {
            listaNotas.addEventListener('change', function (e) {
                if (e.target.classList.contains('nota-checkbox')) {
                    atualizarSelecao(e.target);
                }
            });
        }

        if (listaNotas) {
            listaNotas.addEventListener('click', function (e) {
                const card = e.target.closest('.card-nota');

                if (card && modoSelecaoAtivo) {
                    const checkbox = card.querySelector('.nota-checkbox');

                    if (e.target.closest('.nota-checkbox') !== checkbox) {
                        e.preventDefault();
                        checkbox.checked = !checkbox.checked;

                        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        }

        if (btnCalcularMedia) {
            btnCalcularMedia.addEventListener('click', recalcularMedia);
        }

        if (btnExcluirSelecionadas) {
            btnExcluirSelecionadas.addEventListener('click', function () {
                const notasSelecionadas = listaNotas.querySelectorAll('.nota-checkbox:checked');
                if (notasSelecionadas.length === 0) {
                    alert("Selecione pelo menos uma nota para excluir.");
                    return;
                }
                contagemNotasExcluir.textContent = notasSelecionadas.length;
                modalOverlayNotas.style.display = 'flex';
            });
        }

        if (btnConfirmarExclusao) {
            btnConfirmarExclusao.addEventListener('click', async function () {
                const idsParaExcluir = Array.from(listaNotas.querySelectorAll('.nota-checkbox:checked'))
                    .map(cb => cb.closest('.card-nota').getAttribute('data-id'));

                fecharModalNotas();

                try {
                    const response = await fetch(`${baseApiUrlNotas}/deletar`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(idsParaExcluir)
                    });

                    if (response.ok) {
                        idsParaExcluir.forEach(id => {
                            const cardParaRemover = listaNotas.querySelector(`.card-nota[data-id="${id}"]`);
                            if (cardParaRemover) cardParaRemover.remove();
                        });

                        alert("Avaliações excluídas com sucesso!");
                        toggleModoSelecao(false);
                    } else {
                        const errorText = await response.text();
                        alert(`Falha ao excluir avaliações. Código: ${response.status}. Detalhe: ${errorText}`);
                        toggleModoSelecao(false);
                    }
                } catch (error) {
                    console.error("Erro na requisição DELETE de notas:", error);
                    alert('Erro de comunicação com o servidor ao excluir notas.');
                }
            });
        }

        if (btnCancelarModal) {
            btnCancelarModal.addEventListener('click', fecharModalNotas);
        }
    }
    // Fim da lógica Notas

    /* ----------------- Lógica da Página de PRESENÇA ----------------- */
    const selectTurma = document.getElementById('select-turma');
    const inputDataAula = document.getElementById('input-data-aula');
    const btnSalvar = document.getElementById('btn-salvar-presenca');
    const corpoTabela = document.getElementById('corpo-tabela-presenca');
    const tabelaPresencaDiv = document.getElementById('tabela-presenca');
    const statusMessage = document.getElementById('status-message');

    const scriptTag = document.querySelector('script[data-api-presencas]');
    const baseApiUrlPresencas = scriptTag ? scriptTag.getAttribute('data-api-presencas') : 'https://localhost:7126/api/Presencas';
    const baseApiUrlTurmas = scriptTag ? scriptTag.getAttribute('data-api-turmas') : 'https://localhost:7126/api/Turmas';
    const baseApiUrlAlunos = scriptTag ? scriptTag.getAttribute('data-api-alunos') : 'https://localhost:7126/api/Alunos';

    let alunosDaTurma = [];
    let presencasRegistradas = {};
    let isSaving = false;

    function getAntiForgeryToken() {
        const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]');
        return tokenElement ? tokenElement.value : null;
    }


    function formatarDataParaApi(dataInput) {
        if (!dataInput) return null;
        return dataInput;
    }

    function getSelectedData() {
        const data = inputDataAula.value;
        const turmaId = selectTurma.value;

        if (!turmaId || !data) {
            return null;
        }

        return { turmaId, data: formatarDataParaApi(data) };
    }

    function renderAlunosETabela() {
        const dataObj = getSelectedData();

        if (!dataObj) {
            statusMessage.textContent = 'Selecione uma Turma e uma Data.';
            statusMessage.className = 'mensagem-status';
            statusMessage.style.display = 'block';
            tabelaPresencaDiv.style.display = 'none';
            btnSalvar.disabled = true;
            return;
        }

        if (alunosDaTurma.length === 0) {
            corpoTabela.innerHTML = `
        <div class="aluno-linha aluno-mensagem">
            <div class="col-aluno">Nenhum aluno encontrado nesta turma.</div>
            <div class="col-presenca"></div>
        </div>`;
            statusMessage.style.display = 'none';
            tabelaPresencaDiv.style.display = 'block';
            btnSalvar.disabled = true;
            return;
        }

        let html = '';
        alunosDaTurma.forEach(aluno => {
            const isPresente = presencasRegistradas.hasOwnProperty(aluno.idAluno) ?
                presencasRegistradas[aluno.idAluno] : true;

            const classeIcone = isPresente ? 'fa-check' : 'fa-times';
            const classeCor = isPresente ? 'btn-presente' : 'btn-falta';

            html += `
        <div class="aluno-linha" data-aluno-id="${aluno.idAluno}" data-presenca="${isPresente}">
            <div class="col-aluno">${aluno.nome}</div>
            <div class="col-presenca">
                <button class="btn-toggle-presenca ${classeCor}" data-presente="${isPresente}">
                    <i class="fas ${classeIcone}"></i>
                </button>
            </div>
        </div>`;
        });

        corpoTabela.innerHTML = html;
        statusMessage.style.display = 'none';
        tabelaPresencaDiv.style.display = 'block';
        btnSalvar.disabled = false;
    }

    async function fetchTurmas() {
        if (!baseApiUrlTurmas) return;

        try {
            const response = await fetch(baseApiUrlTurmas);

            if (response.status === 204) {
                selectTurma.innerHTML = '<option value="" disabled selected>Selecione a turma...</option>';
                statusMessage.textContent = 'Nenhuma turma encontrada na base de dados.';
                statusMessage.style.display = 'block';
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Falha ao carregar turmas. Status: ${response.status}. Detalhe: ${errorText.substring(0, 50)}`);
            }

            const turmas = await response.json();

            selectTurma.innerHTML = '<option value="" disabled selected>Selecione a turma...</option>';
            if (turmas.length > 0) {
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.idTurma;
                    option.textContent = `${turma.nome} ${turma.anoLetivo ? `- ${turma.anoLetivo}` : ''}`;
                    selectTurma.appendChild(option);
                });
                statusMessage.style.display = 'none';
            }

        } catch (error) {
            console.error("Erro ao carregar turmas:", error);
            statusMessage.textContent = `Erro ao carregar turmas. ${error.message}`;
            statusMessage.style.display = 'block';
        }
    }

    async function fetchAlunosEPresencas() {
        const dataObj = getSelectedData();
        if (!dataObj) return;

        statusMessage.textContent = 'Carregando lista...';
        statusMessage.style.display = 'block';
        tabelaPresencaDiv.style.display = 'none';

        // Carregar Alunos da Turma
        try {
            const urlAlunos = `${baseApiUrlAlunos}/PorTurma/${dataObj.turmaId}`;
            const responseAlunos = await fetch(urlAlunos);

            if (responseAlunos.status === 204) {
                alunosDaTurma = [];
            } else if (!responseAlunos.ok) {
                throw new Error("Falha ao buscar alunos.");
            } else {
                alunosDaTurma = await responseAlunos.json();
            }

        } catch (error) {
            console.error("Erro ao carregar alunos:", error);
            alunosDaTurma = [];
        }

        // Carregar Presenças (status) da Data/Turma
        try {
            const urlPresencas = `${baseApiUrlPresencas}/turma/${dataObj.turmaId}/data/${dataObj.data}`;
            const responsePresencas = await fetch(urlPresencas);

            if (responsePresencas.status === 204) {
                presencasRegistradas = {};
            } else if (!responsePresencas.ok) {
                throw new Error("Falha ao buscar presenças registradas.");
            } else {
                const listaPresencas = await responsePresencas.json();

                presencasRegistradas = {};
                listaPresencas.forEach(p => {
                    presencasRegistradas[p.idAluno] = p.presente;
                });
            }

        } catch (error) {
            console.warn(`Aviso: ${error.message} Iniciando lista com Presença Total (padrão).`);
            presencasRegistradas = {};
        }

        renderAlunosETabela();
    }


    async function salvarPresencas() {
        const dataObj = getSelectedData();
        if (!dataObj) return;

        const presencasParaSalvar = [];
        corpoTabela.querySelectorAll('.aluno-linha').forEach(linha => {
            const idAluno = linha.getAttribute('data-aluno-id');
            const presente = linha.getAttribute('data-presenca') === 'true'; 

            presencasParaSalvar.push({
                idAluno: idAluno,
                idTurma: dataObj.turmaId,
                dataAula: dataObj.data,
                presente: presente 
            });
        });

        try {
            btnSalvar.textContent = 'SALVANDO...';
            btnSalvar.disabled = true;
            const token = getAntiForgeryToken();

            const response = await fetch(baseApiUrlPresencas, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'RequestVerificationToken': token })
                },
                body: JSON.stringify(presencasParaSalvar)
            });

            if (response.ok || response.status === 204) {
            } else {
                const errorText = await response.text();
                alert(`Falha ao salvar presenças. Código: ${response.status}. Detalhe: ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            console.error("Erro de comunicação ao salvar:", error);
            alert('Erro de comunicação com o servidor ao salvar presenças.');
        } finally {
            btnSalvar.textContent = 'SALVAR';
            btnSalvar.disabled = false;

            selectTurma.value = '';
            inputDataAula.value = '';

            renderAlunosETabela();
        }
    }

    // Listeners de Eventos (Presença)

    if (selectTurma && inputDataAula) {
        if (!inputDataAula.value) {
            const today = new Date().toISOString().split('T')[0];
            inputDataAula.value = today;
        }

        selectTurma.addEventListener('change', fetchAlunosEPresencas);
        inputDataAula.addEventListener('change', fetchAlunosEPresencas);
    }

    if (corpoTabela) {
        corpoTabela.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-toggle-presenca');

            if (btn) {
                console.log('Botão de Presença Clicado! Iniciando toggle.');

                e.preventDefault();

                e.stopImmediatePropagation();
                const linha = btn.closest('.aluno-linha');
                const isPresenteAtual = btn.getAttribute('data-presente') === 'true';
                const isPresenteNovo = !isPresenteAtual;

                linha.setAttribute('data-presenca', isPresenteNovo);
                btn.setAttribute('data-presente', isPresenteNovo);

                btn.classList.toggle('btn-presente', isPresenteNovo);
                btn.classList.toggle('btn-falta', !isPresenteNovo);

                const icone = btn.querySelector('i');
                if (icone) {
                    icone.classList.toggle('fa-check', isPresenteNovo);
                    icone.classList.toggle('fa-times', !isPresenteNovo);
                }
                console.log(`Novo status definido: ${isPresenteNovo ? 'PRESENTE (Verde / Check)' : 'FALTA (Vermelho / X)'}`);
            }
        });
    }

    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarPresencas);
    }

    if (selectTurma) {
        fetchTurmas();
    }
});