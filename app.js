// js/app.js

class GerenciadorEquipamentos {
    constructor() {
        this.initialized = false;
        this.dataAtual = this.getDataAtualFormatada();
        this.estadosAtuais = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚢 Inicializando sistema de controle de equipamentos...');
            
            // Adiciona classe de loading
            document.body.classList.add('loading');
            
            // Configurar data
            await this.configurarData();
            
            // Carregar dados da data selecionada
            await this.carregarDadosDaData();
            
            // Criar interface
            await this.criarBotoesEquipamentos();
            
            // Configurar controles de combustível
            this.configurarCombustiveis();
            
            // Configurar auto-save
            this.configurarAutoSave();
            
            // Configurar shortcuts
            this.configurarShortcuts();
            
            this.initialized = true;
            console.log('✅ Sistema inicializado com sucesso!');
            
            // Mostrar mensagem de boas-vindas
            this.mostrarMensagem(Sistema carregado para ${this.formatarData(this.dataAtual)}, 'success');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.mostrarMensagem('Erro ao inicializar o sistema', 'error');
        } finally {
            document.body.classList.remove('loading');
        }
    }

    // ========== MÉTODOS DE DATA ==========
    
    getDataAtualFormatada() {
        const hoje = new Date();
        return hoje.toISOString().split('T')[0];
    }

    async configurarData() {
        return new Promise((resolve) => {
            const dataInput = document.getElementById('dataSelecionada');
            const dataExibicao = document.getElementById('dataExibicao');
            
            // Tenta carregar data salva
            const dataSalva = localStorage.getItem('dataControle');
            this.dataAtual = dataSalva || this.dataAtual;
            
            // Configurar data atual
            dataInput.value = this.dataAtual;
            dataExibicao.textContent = this.formatarData(this.dataAtual);
            
            // Configurar data máxima (hoje)
            dataInput.max = this.getDataAtualFormatada();
            
            // Event listener para mudança de data
            dataInput.addEventListener('change', async (e) => {
                if (!this.initialized) return;
                
                document.body.classList.add('loading');
                try {
                    // Salva estados atuais antes de mudar
                    await this.salvarEstado();
                    
                    this.dataAtual = e.target.value;
                    dataExibicao.textContent = this.formatarData(this.dataAtual);
                    
                    await this.carregarDadosDaData();
                    await this.atualizarInterface();
                    this.salvarData();
                    
                    this.mostrarMensagem(Dados carregados para ${this.formatarData(this.dataAtual)}, 'info');
                    
                } catch (error) {
                    console.error('Erro ao mudar data:', error);
                    this.mostrarMensagem('Erro ao carregar dados da nova data', 'error');
                } finally {
                    document.body.classList.remove('loading');
                }
            });
            
            resolve();
        });
    }

    formatarData(dataString) {
        try {
            const data = new Date(dataString + 'T00:00:00');
            return data.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dataString;
        }
    }

    // ========== GERENCIAMENTO DE DADOS ==========
    
    async carregarDadosDaData() {
        return new Promise((resolve) => {
            try {
                const chave = ${CONFIG.storage.prefix}${this.dataAtual};
                const dadosSalvos = localStorage.getItem(chave);
                
                if (dadosSalvos) {
                    const parsed = JSON.parse(dadosSalvos);
                    
                    // Verifica se é a versão correta
                    if (parsed && parsed.version === CONFIG.storage.version) {
                        this.estadosAtuais = parsed.estados || {};
                        console.log(📂 Dados carregados para ${this.dataAtual});
                    } else {
                        this.estadosAtuais = {};
                        console.log('⚠️ Versão de dados diferente, iniciando limpo');
                    }
                } else {
                    this.estadosAtuais = {};
                    console.log('📝 Nenhum dado salvo para esta data');
                }
                
                resolve();
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                this.estadosAtuais = {};
                resolve();
            }
        });
    }

    async salvarEstado() {
        return new Promise((resolve) => {
            try {
                const dadosParaSalvar = {
                    version: CONFIG.storage.version,
                    data: this.dataAtual,
                    estados: this.estadosAtuais,
                    timestamp: new Date().toISOString()
                };
                
                const chave = ${CONFIG.storage.prefix}${this.dataAtual};
                localStorage.setItem(chave, JSON.stringify(dadosParaSalvar));
                
                console.log('💾 Estados salvos com sucesso');
                resolve(true);
            } catch (error) {
                console.error('Erro ao salvar estados:', error);
                resolve(false);
            }
        });
    }

    salvarData() {
        try {
            localStorage.setItem('dataControle', this.dataAtual);
        } catch (error) {
            console.error('Erro ao salvar data:', error);
        }
    }

    // ========== INTERFACE ==========
    
    async criarBotoesEquipamentos() {
        const container = document.getElementById("equipamentos");
        
        // Limpa container
        container.innerHTML = '';
        
        // Cria botões
        for (let i = 0; i < CONFIG.equipamentos.length; i++) {
            const equipamento = CONFIG.equipamentos[i];
            
            // Inicializa estado se não existir
            if (this.estadosAtuais[equipamento] === undefined) {
                this.estadosAtuais[equipamento] = 3; // Estado padrão: Disponível
            }
            
            const btn = this.criarBotaoEquipamento(equipamento);
            container.appendChild(btn);
            
            // Pequeno delay para não travar a UI
            if (i % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        this.atualizarContadorEstados();
    }

    criarBotaoEquipamento(equipamento) {
        const btn = document.createElement("button");
        btn.className = "equipamento-btn";
        btn.textContent = equipamento;
        btn.title = Clique para mudar status\nClique direito para resetar;
        
        this.atualizarAparenciaBotao(btn, equipamento);
        
        // Clique esquerdo - alternar estado
        btn.addEventListener("click", () => {
            this.alternarEstado(equipamento, btn);
        });
        
        // Clique direito - resetar estado
        btn.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            this.resetarEstado(equipamento, btn);
        });

        return btn;
    }

    alternarEstado(equipamento, elemento) {
        if (!this.initialized) return;
        
        const estadoAtual = this.estadosAtuais[equipamento];
        const novoEstado = (estadoAtual + 1) % CONFIG.estados.length;
        
        this.estadosAtuais[equipamento] = novoEstado;
        this.atualizarAparenciaBotao(elemento, equipamento);
        this.atualizarContadorEstados();
        
        const estadoInfo = CONFIG.estados[novoEstado];
        console.log(🔄 ${equipamento}: ${estadoInfo.texto});
        
        // Feedback visual
        elemento.style.transform = 'scale(0.95)';
        setTimeout(() => {
            elemento.style.transform = '';
        }, 150);
    }

    resetarEstado(equipamento, elemento) {
        if (!this.initialized) return;
        
        this.estadosAtuais[equipamento] = 3; // Volta para "Disponível"
        this.atualizarAparenciaBotao(elemento, equipamento);
        this.atualizarContadorEstados();
        
        console.log(🔄 ${equipamento}: resetado para Disponível);
        
        // Feedback visual
        elemento.style.backgroundColor = '#f0f0f0';
        elemento.style.color = '#333';
        setTimeout(() => {
            elemento.style.backgroundColor = '';
            elemento.style.color = '';
        }, 300);
    }

    atualizarAparenciaBotao(botao, equipamento) {
        const estadoIndex = this.estadosAtuais[equipamento];
        const estado = CONFIG.estados[estadoIndex];
        
        if (estado) {
            // Limpa todas as classes de cor
            botao.className = "equipamento-btn";
            if (estado.classe) {
                botao.classList.add(estado.classe);
            }
            
            // Atualiza tooltip
            botao.title = ${equipamento}\nStatus: ${estado.texto}\n${estado.descricao}\n\nClique para mudar status\nClique direito para resetar;
        }
    }

    async atualizarInterface() {
        await this.criarBotoesEquipamentos();
    }

    atualizarContadorEstados() {
        const contador = document.getElementById("contadorEstados");
        if (!contador) return;
        
        const counts = {};
        
        // Inicializa contadores
        CONFIG.estados.forEach((_, index) => {
            counts[index] = 0;
        });

        // Conta os estados
        Object.values(this.estadosAtuais).forEach(estado => {
            if (estado !== undefined && counts[estado] !== undefined) {
                counts[estado] = (counts[estado] || 0) + 1;
            }
        });

        // Cria texto do contador
        const textos = CONFIG.estados.map((estado, index) => 
            ${estado.texto}: <strong>${counts[index] || 0}</strong>
        );
        
        contador.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                ${textos.map(texto => <span>${texto}</span>).join('')}
            </div>
            <div style="margin-top: 5px; font-size: 0.85em; color: #666;">
                Total: <strong>${CONFIG.equipamentos.length}</strong> equipamentos | 
                Data: <strong>${this.dataAtual}</strong>
            </div>
        `;
    }

    // ========== COMBUSTÍVEIS ==========
    
    configurarCombustiveis() {
        CONFIG.combustiveis.forEach(combustivel => {
            const input = document.getElementById(combustivel.id);
            if (!input) return;
            
            // Carregar valor salvo
            const carregarValor = () => {
                try {
                    const salvo = localStorage.getItem(combustivel_${combustivel.id}_${this.dataAtual});
                    if (salvo !== null) {
                        input.value = salvo;
                    } else {
                        input.value = combustivel.valorPadrao;
                    }
                } catch (error) {
                    console.error('Erro ao carregar combustível:', error);
                    input.value = combustivel.valorPadrao;
                }
            };
            
            // Salvar valor
            const salvarValor = () => {
                try {
                    localStorage.setItem(combustivel_${combustivel.id}_${this.dataAtual}, input.value);
                    console.log(⛽ ${combustivel.nome}: ${input.value} ${combustivel.unidade} salvo);
                } catch (error) {
                    console.error('Erro ao salvar combustível:', error);
                }
            };
            
            // Event listeners
            input.addEventListener('change', salvarValor);
            input.addEventListener('input', salvarValor);
            
            // Carregar ao inicializar
            carregarValor();
            
            // Recarregar quando mudar a data
            document.getElementById('dataSelecionada').addEventListener('change', carregarValor);
        });
    }

    // ========== UTILITÁRIOS ==========
    
    configurarAutoSave() {
        // Salva a cada 5 segundos se houver mudanças
        setInterval(async () => {
            if (this.initialized && Object.keys(this.estadosAtuais).length > 0) {
                await this.salvarEstado();
            }
        }, 5000);
    }

    configurarShortcuts() {
        // Shortcut Ctrl+S para salvar manualmente
        document.addEventListener('keydown', async (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                await this.salvarEstado();
                this.mostrarMensagem('Dados salvos com sucesso!', 'success');
            }
            
            // Ctrl+D para voltar para data atual
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                document.getElementById('dataSelecionada').value = this.getDataAtualFormatada();
                document.getElementById('dataSelecionada').dispatchEvent(new Event('change'));
            }
        });
    }

    mostrarMensagem(texto, tipo = 'info') {
        // Cria elemento de mensagem
        const mensagem = document.createElement('div');
        mensagem.textContent = texto;
        mensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Cores por tipo
        const cores = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        
        mensagem.style.backgroundColor = cores[tipo] || '#2196F3';
        
        // Adiciona ao documento
        document.body.appendChild(mensagem);
        
        // Remove após 3 segundos
        setTimeout(() => {
            mensagem.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (mensagem.parentNode) {
                    mensagem.parentNode.removeChild(mensagem);
                }
            }, 300);
        }, 3000);
        
        // Adiciona animações CSS se não existirem
        if (!document.querySelector('#animacoes-mensagem')) {
            const style = document.createElement('style');
            style.id = 'animacoes-mensagem';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ========== BACKUP E RESTAURAÇÃO ==========
    
    gerarBackup() {
        const backup = {
            version: CONFIG.storage.version,
            data: this.dataAtual,
            estados: this.estadosAtuais,
            combustiveis: {},
            timestamp: new Date().toISOString()
        };
        
        // Adiciona valores de combustíveis
        CONFIG.combustiveis.forEach(c => {
            const input = document.getElementById(c.id);
            if (input) {
                backup.combustiveis[c.id] = input.value;
            }
        });
        
        return JSON.stringify(backup, null, 2);
    }
}

// ========== INICIALIZAÇÃO ==========

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar suporte a localStorage
    if (!window.localStorage) {
        alert('⚠️ Seu navegador não suporta armazenamento local. Os dados não serão salvos.');
    }
    
    // Inicializar sistema
    window.gerenciador = new GerenciadorEquipamentos();
    
    // Adicionar informações de debug no console
    console.log('🎯 Dicas úteis:');
    console.log('- Clique em um equipamento para mudar o status');
    console.log('- Clique com o botão direito para resetar para "Disponível"');
    console.log('- Pressione Ctrl+S para salvar manualmente');
    console.log('- Pressione Ctrl+D para voltar à data atual');
});

// Prevenir perda de dados ao recarregar a página
window.addEventListener('beforeunload', async (event) => {
    if (window.gerenciador && window.gerenciador.initialized) {
        await window.gerenciador.salvarEstado();
    }
});