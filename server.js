const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Jogador, Capitao } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/copa_quadra_7';

mongoose.connect(url)
    .then(() => console.log("✅ Conectado ao MongoDB via Docker"))
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// --- ESTADO DO DRAFT EM MEMÓRIA ---
let draftIniciado = false;
let poteAtual = 1;
let ordemVez = [];
let indexVez = 0;

const CAPITAES_IDS = [2, 3, 8, 19, 21, 23, 43, 46, 51]; 
const IDS_FIXOS = [3, 32, 17, 29, 46, 15, 62, 63, 23, 25, 24, 37, 43, 44, 45, 18, 51, 50, 55, 56, 19, 28, 39, 59, 2, 33, 5, 53, 8, 66, 65, 21, 20, 22, 52];
const IDS_POTE_2 = [6, 7, 9, 11, 12, 13, 14, 27, 30];

// --- LOGICA DE ORDEM POR POTE ---
function gerarOrdemParaPote(pote) {
    let base = [...CAPITAES_IDS].sort((a, b) => a - b);
    if (pote === 1) return base; // Crescente
    if (pote === 2) return base.reverse(); // Decrescente
    return base.sort(() => Math.random() - 0.5); // Sorteio
}

async function getDisponiveis() {
    if (poteAtual === 1) return await Jogador.find({ tipo: 'Goleiro', selecionado: false });
    if (poteAtual === 2) return await Jogador.find({ idOriginal: { $in: IDS_POTE_2 }, selecionado: false });
    return await Jogador.find({ idOriginal: { $nin: [...IDS_POTE_2, ...IDS_FIXOS] }, tipo: 'Linha', selecionado: false });
}

// --- FUNÇÃO DE SINCRONIZAÇÃO TOTAL ---
async function atualizarTodos(target = io) {
    const caps = await Capitao.find().sort({ idTime: 1 });
    const disp = await getDisponiveis();
    const todos = await Jogador.find().sort({ idOriginal: 1 });
    
    target.emit('atualizacao_geral', { 
        capitães: caps, 
        draftIniciado, 
        poteAtual, 
        capitãoVez: ordemVez[indexVez] || null, 
        jogadoresDisponiveis: disp,
        todosJogadores: todos
    });
}

app.post('/login-capitao', async (req, res) => {
    const { username, password } = req.body; 
    try {
        const capitao = await Capitao.findOne({ username: username.toString() });
        if (capitao && await bcrypt.compare(password, capitao.password)) {
            res.json({ success: true, idTime: capitao.idTime, nomeCapitão: capitao.capPessoa, nomeTime: capitao.nomeTime });
        } else {
            res.status(401).json({ success: false, message: "ID ou Senha incorretos!" });
        }
    } catch (err) { res.status(500).json({ error: "Erro no servidor" }); }
});

io.on('connection', async (socket) => {
    console.log('📱 Usuário conectado:', socket.id);
    await atualizarTodos(socket); // Garante que quem entra veja o estado atualizado

    socket.on('liberar_draft', async () => {
        draftIniciado = true;
        poteAtual = 1;
        ordemVez = gerarOrdemParaPote(1);
        indexVez = 0;
        await atualizarTodos();
    });

    socket.on('resetar_draft_total', async () => {
        await Jogador.updateMany({ idOriginal: { $nin: IDS_FIXOS } }, { $set: { selecionado: false } });
        const caps = await Capitao.find({});
        for (let c of caps) {
            c.time = c.time.filter(j => IDS_FIXOS.includes(j.idOriginal));
            await c.save();
        }
        draftIniciado = false;
        poteAtual = 1;
        indexVez = 0;
        ordemVez = [];
        await atualizarTodos();
    });

    socket.on('escolher_jogador', async (dados) => {
        if (!draftIniciado) return;
        const { jogadorId, capIdTime } = dados;

        // Compara como números para evitar erros de string "3" !== 3
        if (Number(capIdTime) !== Number(ordemVez[indexVez])) return;

        const jog = await Jogador.findOne({ idOriginal: jogadorId, selecionado: false });
        if (jog) {
            jog.selecionado = true;
            await jog.save();

            await Capitao.findOneAndUpdate({ idTime: Number(capIdTime) }, { $push: { time: jog } });

            indexVez++;

            // Troca de pote após as 9 escolhas dos capitães
            if (indexVez >= 9) {
                poteAtual++;
                if (poteAtual > 3) {
                    draftIniciado = false;
                    indexVez = 0;
                    io.emit('draft_finalizado');
                } else {
                    ordemVez = gerarOrdemParaPote(poteAtual);
                    indexVez = 0;
                }
            }
            await atualizarTodos();
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Rodando em: http://localhost:${PORT}`));