const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// --- DATABASE (Jogadores extraídos do seu CSV) ---
const JOGADORES_LINHA = [
    { id: 2, nome: "Frederico", posicao: "Ataque", skill: 10, selecionado: true },
    { id: 3, nome: "Murillo Vale Pires", posicao: "Ataque", skill: 3, selecionado: true },
    { id: 5, nome: "Celso", posicao: "Ataque", skill: 9, selecionado: true },
    { id: 6, nome: "Mateus Brelaz", posicao: "Meio", skill: 10, selecionado: false },
    { id: 7, nome: "Vitinho", posicao: "Meio", skill: 6, selecionado: false },
    { id: 8, nome: "Danilo", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 9, nome: "Trevor", posicao: "Ataque", skill: 8, selecionado: false },
    { id: 11, nome: "Pedro Antônio Raiol de Souza", posicao: "Meio", skill: 8, selecionado: false },
    { id: 12, nome: "Renato", posicao: "Meio", skill: 6, selecionado: false },
    { id: 13, nome: "Alexsandro Caetano", posicao: "Meio", skill: 6, selecionado: false },
    { id: 14, nome: "Jotagol", posicao: "Ataque", skill: 1, selecionado: false },
    { id: 15, nome: "Nelson", posicao: "Defesa", skill: 7, selecionado: true },
    { id: 17, nome: "Cauã paraense", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 18, nome: "Arley Nikson", posicao: "Meio", skill: 8, selecionado: true },
    { id: 19, nome: "Jokhsan", posicao: "Meio", skill: 6, selecionado: true },
    { id: 20, nome: "Alberto Henrique Rodrigues Araujo Filho", posicao: "Ataque", skill: 6, selecionado: true },
    { id: 21, nome: "Gustavo Sarquis", posicao: "Meio", skill: 8, selecionado: true },
    { id: 22, nome: "VINICIUS", posicao: "Ataque", skill: 7, selecionado: true },
    { id: 23, nome: "Drus", posicao: "Goleiro/Linha", skill: 8, selecionado: true },
    { id: 24, nome: "Yuri Senna", posicao: "Meio", skill: 10, selecionado: true },
    { id: 25, nome: "David simões", posicao: "Meio", skill: 7, selecionado: true },
    { id: 27, nome: "Eduardo Oliveira Nascimento", posicao: "Defesa", skill: 7, selecionado: false },
    { id: 28, nome: "Joel Júnior Silva Ozório", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 29, nome: "Cauã Braz", posicao: "Meio", skill: 8, selecionado: true },
    { id: 30, nome: "Kayo Ludovico", posicao: "Ataque", skill: 7, selecionado: false },
    { id: 32, nome: "Marcos Vinicius da Silva Menezes", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 33, nome: "Marcio Filho", posicao: "Meio", skill: 7, selecionado: true },
    { id: 34, nome: "Rian Vieira", posicao: "Ataque", skill: 6, selecionado: false },
    { id: 36, nome: "Luiz eduardo 07", posicao: "Defesa", skill: 6, selecionado: false },
    { id: 37, nome: "Matheus Dias", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 38, nome: "Andrey Barbosa Farias Siova", posicao: "Meio", skill: 5, selecionado: false },
    { id: 39, nome: "Samuel Melo Nowell", posicao: "Meio", skill: 10, selecionado: true },
    { id: 41, nome: "gabriel Bentes", posicao: "Ataque", skill: 10, selecionado: false },
    { id: 42, nome: "Cayan", posicao: "Meio", skill: 7, selecionado: false },
    { id: 43, nome: "Gustavo Araujo", posicao: "Defesa", skill: 7, selecionado: true },
    { id: 44, nome: "Rafael Souza", posicao: "Meio", skill: 9, selecionado: true },
    { id: 45, nome: "Athyrson Barreto", posicao: "Meio", skill: 9, selecionado: true },
    { id: 46, nome: "davi prymo", posicao: "Meio", skill: 7, selecionado: true },
    { id: 47, nome: "Botelho", posicao: "Meio", skill: 7, selecionado: false },
    { id: 48, nome: "Kauã Reis", posicao: "Meio", skill: 8, selecionado: false },
    { id: 49, nome: "Vicenzo", posicao: "Ataque", skill: 10, selecionado: false },
    { id: 50, nome: "Facundo", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 51, nome: "Vitor Quaresma", posicao: "Meio", skill: 7, selecionado: true },
    { id: 52, nome: "Vini jr", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 53, nome: "Andre Garuzzi", posicao: "Ataque", skill: 7, selecionado: true },
    { id: 55, nome: "Matheus Dos Anjos Ferreira", posicao: "Meio", skill: 7, selecionado: true },
    { id: 56, nome: "Arthur dos Anjos Ferreira", posicao: "Meio", skill: 8, selecionado: true },
    { id: 57, nome: "Isaque Costa", posicao: "Ataque", skill: 10, selecionado: false },
    { id: 58, nome: "João Fleury", posicao: "Defesa", skill: 6, selecionado: false },
    { id: 59, nome: "André Matheus", posicao: "Meio", skill: 10, selecionado: true },
    { id: 60, nome: "Andrey Silva Santos", posicao: "Defesa", skill: 8, selecionado: false },
    { id: 61, nome: "Lucas Caleb Gonçalves de Oliveira", posicao: "Ataque", skill: 8, selecionado: false },
    { id: 62, nome: "gustavo linhares", posicao: "Ataque", skill: 9, selecionado: true },
    { id: 63, nome: "Vilhena", posicao: "Ataque", skill: 8, selecionado: true },
    { id: 64, nome: "Cleydson", posicao: "Meio", skill: 5, selecionado: false },
    { id: 65, nome: "Giovanne Alves", posicao: "Defesa", skill: 7, selecionado: true },
    { id: 66, nome: "Theo", posicao: "Meio", skill: 7, selecionado: true }
];

const GOLEIROS = [
    { id: 35, nome: "Botinho", posicao: "Goleiro", skill: 8, selecionado: false },
    { id: 26, nome: "Yuri", posicao: "Goleiro", skill: 10, selecionado: false },
    { id: 40, nome: "Santos", posicao: "Goleiro", skill: 8, selecionado: false },
    { id: 4, nome: "Leal", posicao: "Goleiro", skill: 7, selecionado: false },
    { id: 31, nome: "Ranieri", posicao: "Goleiro", skill: 9, selecionado: false },
    { id: 67, nome: "Dante", posicao: "Goleiro", skill: 7, selecionado: false },
    { id: 54, nome: "Eluan", posicao: "Goleiro", skill: 7, selecionado: false },
    { id: 16, nome: "Sancley", posicao: "Goleiro", skill: 8, selecionado: false }
];

const IDS_POTE_2 = [6, 7, 9, 11, 12, 13, 14, 27, 30];

// --- INICIALIZAÇÃO DOS TIMES ---
let capitães = [
    { id: 1, nome: "Senegala 🇸🇳", time: JOGADORES_LINHA.filter(j => [3, 32, 17, 29].includes(j.id)), online: false, capPessoa: "" },
    { id: 2, nome: "Arábia Maldita 🇸🇦", time: JOGADORES_LINHA.filter(j => [46, 15, 62, 63].includes(j.id)), online: false, capPessoa: "" },
    { id: 3, nome: "Laranja Mecânica 🇳🇱", time: JOGADORES_LINHA.filter(j => [23, 25, 24, 37].includes(j.id)), online: false, capPessoa: "" },
    { id: 4, nome: "Baile da Colômbia FC 🇨🇴", time: JOGADORES_LINHA.filter(j => [43, 44, 45, 18].includes(j.id)), online: false, capPessoa: "" },
    { id: 5, nome: "Nicaralhos 🇳🇮", time: JOGADORES_LINHA.filter(j => [51, 50, 55, 56].includes(j.id)), online: false, capPessoa: "" },
    { id: 6, nome: "Holaduras 🇭🇳", time: JOGADORES_LINHA.filter(j => [19, 28, 39, 59].includes(j.id)), online: false, capPessoa: "" },
    { id: 7, nome: "4º Reich 🇩🇪", time: JOGADORES_LINHA.filter(j => [2, 33, 5, 53].includes(j.id)), online: false, capPessoa: "" },
    { id: 8, nome: "Espanhola 🇪🇸", time: JOGADORES_LINHA.filter(j => [8, 66, 65].includes(j.id)), online: false, capPessoa: "" },
    { id: 9, nome: "República Xeca 🇨🇿", time: JOGADORES_LINHA.filter(j => [21, 20, 22, 52].includes(j.id)), online: false, capPessoa: "" }
];

let draftIniciado = false;
let poteAtual = 1;
let ordemVez = [];
let indexVez = 0;

function sortearOrdem() {
    ordemVez = capitães.map(c => c.id).sort(() => Math.random() - 0.5);
    indexVez = 0;
}

function getDisponiveis() {
    if (poteAtual === 1) return GOLEIROS.filter(g => !g.selecionado);
    if (poteAtual === 2) return JOGADORES_LINHA.filter(j => IDS_POTE_2.includes(j.id) && !j.selecionado);
    return JOGADORES_LINHA.filter(j => !IDS_POTE_2.includes(j.id) && !j.selecionado && !capitães.some(c => c.time.some(p => p.id === j.id)));
}

io.on('connection', (socket) => {
    // Ao ligar, envia o estado atual
    socket.emit('config_atual', { 
        capitães, draftIniciado, poteAtual, 
        capitãoVez: ordemVez[indexVez], 
        jogadoresDisponiveis: getDisponiveis()
    });

    // Capitão entra no time
    socket.on('set_identidade', (dados) => {
        const cap = capitães.find(c => c.id == dados.timeId);
        if (cap) {
            cap.capPessoa = dados.nomePessoa;
            cap.online = true;
            io.emit('atualizacao_geral', { capitães });
        }
    });

    // Início do Draft
    socket.on('liberar_draft', () => {
        draftIniciado = true;
        poteAtual = 1;
        sortearOrdem();
        io.emit('draft_liberado', { poteAtual, capitãoVez: ordemVez[indexVez], jogadoresDisponiveis: getDisponiveis() });
    });

    // Escolha de Jogador
    socket.on('escolher_jogador', (dados) => {
        if (!draftIniciado) return;
        const { jogadorId, capId } = dados;
        if (capId !== ordemVez[indexVez]) return;

        let lista = (poteAtual === 1) ? GOLEIROS : JOGADORES_LINHA;
        let p = lista.find(j => j.id == jogadorId);

        if (p && !p.selecionado) {
            const cap = capitães.find(c => c.id == capId);
            p.selecionado = true;
            cap.time.push(p);
            indexVez++;

            const limitePote = (poteAtual === 1) ? 8 : 9;

            if (indexVez >= limitePote) {
                poteAtual++;
                if (poteAtual > 3) {
                    draftIniciado = false;
                    io.emit('draft_finalizado', { capitães }); // SINAL PARA O CARROSSEL
                } else {
                    sortearOrdem();
                }
            }

            io.emit('atualizacao_geral', { 
                capitães, poteAtual, 
                capitãoVez: ordemVez[indexVez], 
                jogadoresDisponiveis: getDisponiveis() 
            });
        }
    });

    // Admin encerra manual
    socket.on('sortear_grupos', () => {
        draftIniciado = false;
        io.emit('draft_finalizado', { capitães });
    });
});

server.listen(process.env.PORT || 3000, () => console.log("Servidor Online"));