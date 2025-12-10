// js/config.js

// CONFIGURAÇÕES DO SISTEMA
const CONFIG = {
    // Estados possíveis dos equipamentos
    estados: [
        { 
            classe: "verde", 
            texto: "Na linha", 
            cor: "#4CAF50",
            descricao: "Equipamento operando normalmente"
        },
        { 
            classe: "amarela", 
            texto: "com Restrição", 
            cor: "#ffcc00",
            descricao: "Operando com limitações"
        },
        { 
            classe: "azul", 
            texto: "de Serviço", 
            cor: "#2196F3",
            descricao: "Em manutenção ou serviço"
        },
        { 
            classe: "", 
            texto: "Disponível", 
            cor: "#f0f0f0",
            descricao: "Pronto para uso"
        },
        { 
            classe: "vermelho", 
            texto: "Indisponível", 
            cor: "#f44336",
            descricao: "Fora de operação"
        }
    ],
    
    // Lista de equipamentos do navio
    equipamentos: [
        "MCP BB", "MCP BE", "MCA 1", "MCA 2", "MCA 3", "MCA 4", "Gerador de Emerg", 
        "URA 1", "URA 2", "URA 3", "URA 4", "URA 5", "URA 6",
        "GOR 1", "GOR 2", "GOR 3", "GOR 4", "DEMIN",
        "Maquina do Leme BE 1", "Maquina do Leme BE 2", 
        "Maquina do Leme BB 1", "Maquina do Leme BB 2",
        "HPSW 1", "HPSW 2", "HPSW 3", "HPSW 4", "HPSW 5",
        "LPSW 1", "LPSW 2", "LPSW 3", "LPSW 4",
        "Bomba de Serviço 1", "Bomba de Serviço 2", "Bomba de Serviço 3",
        "MotoBomba 1", "MotoBomba 2", "MotoBomba 3", "MotoBomba 4",
        "CAP 1", "CAP 2", "CAP 3", "CMP 1", "CMP 2", "CMP de Emergência",
        "CBP 1", "CBP 2", "CBP 3", "CBP 4",
        "Planta Frigorífica 1", "Planta Frigorífica 2",
        "Estabilizador BB", "Estabilizador BE", 
        "BAG 1", "BAG 2", "BAG 3", "BAG 4",
        "BOILER 1", "BOILER 2", "BOILER 3", "BOILER 4",
        "Bomba de Água Quente 1", "Bomba de Água Quente 2",
        "Separador de Óleo/Água",
        "Purificador Óleo Comb 1", "Purificador Óleo Comb 2",
        "Purificador Óleo Lub 1", "Purificador Óleo Lub 2",
        "Purificador Redutora 1", "Purificador Redutora 2",
        "Purificador Óleo Lub GER Diesel",
        "Elevador de Aeronaves AV", "Elevador de Aeronaves AR",
        "Guindaste", "Container 1", "Container 2", "Container 3",
        "Proteção Catódica AV", "Proteção Catódica AR"
    ],
    
    // Configurações do navio
    navio: {
        nome: "NAM ATLÂNTICO - A140",
        tipo: "Navio-Aeródromo Multipropósito",
        brasao: "🚢" // Emoji temporário
    },
    
    // Configurações de armazenamento
    storage: {
        prefix: "navio_equipamentos_",
        version: "1.0.0"
    },
    
    // Configurações de combustíveis
    combustiveis: [
        { id: "agua", nome: "Aguada", unidade: "m³", valorPadrao: 555 },
        { id: "oleo_lub", nome: "Óleo lub", unidade: "m³", valorPadrao: 98 },
        { id: "oleo_comb", nome: "Óleo comb", unidade: "m³", valorPadrao: 100 },
        { id: "jp5", nome: "JP5", unidade: "m³", valorPadrao: 150 }
    ]
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
