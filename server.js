const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// --- DATABASE DE TESTE (63 NOMES) ---
const nomesFicticios = ["Vini Jr.", "Benzema", "Modric", "Kroos", "Courtois", "Haaland", "Mbappé", "De Bruyne", "Kane", "Salah", "Pedri", "Gavi", "Lewandowski", "Musiala", "Bellingham", "Saka", "Odegaard", "Rashford", "Casemiro", "Alisson", "Ederson", "Ruben Dias", "Van Dijk", "Hakimi", "Theo Hernandez", "Kimmich", "Rodri", "Bernardo Silva", "Grealish", "Foden", "Leão", "Osimhen", "Kvaratskhelia", "Lautaro", "Barella", "Dybala", "Griezmann", "João Félix", "Valverde", "Militão", "Bruno Guimarães", "Paquetá", "Richarlison", "Raphinha", "Antony", "Gabriel Jesus", "Martinelli", "Fabinho", "Rodrygo", "Neymar", "Messi", "Cristiano Ronaldo", "Ibrahimovic", "Talisca"];
let jogadoresInscritos = nomesFicticios.map((nome, i) => ({ id: i + 1, nome, selecionado: false, skill: Math.floor(Math.random() * 20) + 75 }));
let goleiros = ["Muralha", "Gato", "Paredão", "Luva", "Mãos de Ferro", "Falcão", "Aranha", "Kahn", "Dida"].map((nome, i) => ({ id: i + 100, nome, selecionado: false, skill: 85 }));

const ADMIN_PASS = "admin123";
let capitães = []; 
let draftIniciado = false;
let rodadaGeral = 1;
let trioCapitãesVez = []; 
let capitãoAtualIndex = 0; 
let trioJogadoresVez = []; 
let grupos = { A: [], B: [], C: [] };
let jogos = [];

function prepararNovaRodadaTrio() {
    trioCapitãesVez = [...capitães].sort(() => 0.5 - Math.random()).slice(0, 3);
    capitãoAtualIndex = 0;
    const jogsDisponiveis = jogadoresInscritos.filter(j => !j.selecionado);
    trioJogadoresVez = jogsDisponiveis.sort(() => 0.5 - Math.random()).slice(0, 3);
}

app.post('/login-admin', (req, res) => {
    if (req.body.password === ADMIN_PASS) res.json({ success: true });
    else res.status(401).json({ success: false });
});

io.on('connection', (socket) => {
    socket.emit('config_atual', { capitães, draftIniciado, trioJogs: trioJogadoresVez, trioCaps: trioCapitãesVez, indexVez: capitãoAtualIndex, grupos, jogos });

    socket.on('set_capitaes', (lista) => {
        capitães = lista.map((nome, i) => ({ id: i, nome, time: [] }));
        io.emit('config_atual', { capitães });
    });

    socket.on('liberar_draft', () => {
        draftIniciado = true;
        prepararNovaRodadaTrio();
        io.emit('draft_liberado', { trioJogs: trioJogadoresVez, trioCaps: trioCapitãesVez, indexVez: capitãoAtualIndex });
    });

    socket.on('escolher_jogador', (jogadorId) => {
        if(!draftIniciado) return;
        const jogador = trioJogadoresVez.find(j => j.id === jogadorId);
        if (jogador && !jogador.selecionado) {
            const capVez = trioCapitãesVez[capitãoAtualIndex];
            jogador.selecionado = true;
            jogadoresInscritos.find(j => j.id === jogadorId).selecionado = true;
            capitães.find(c => c.id === capVez.id).time.push(jogador);
            capitãoAtualIndex++;
            if (capitãoAtualIndex === 3) {
                rodadaGeral++;
                if (rodadaGeral === 3) {
                    const g = [...goleiros].sort(() => 0.5 - Math.random());
                    capitães.forEach((c, i) => c.time.push(g[i]));
                }
                prepararNovaRodadaTrio();
            }
            io.emit('atualizacao_geral', { capitães, trioJogs: trioJogadoresVez, trioCaps: trioCapitãesVez, indexVez: capitãoAtualIndex });
        }
    });

    socket.on('sortear_grupos', () => {
        const emb = [...capitães].sort(() => 0.5 - Math.random());
        grupos.A = emb.slice(0, 3); grupos.B = emb.slice(3, 6); grupos.C = emb.slice(6, 9);
        jogos = [];
        ['A', 'B', 'C'].forEach(g => {
            const t = grupos[g];
            jogos.push({ id: Math.random(), gp: g, t1: t[0].nome, t2: t[1].nome, p1:0, p2:0 });
            jogos.push({ id: Math.random(), gp: g, t1: t[1].nome, t2: t[2].nome, p1:0, p2:0 });
            jogos.push({ id: Math.random(), gp: g, t1: t[2].nome, t2: t[0].nome, p1:0, p2:0 });
        });
        io.emit('grupos_definidos', { grupos, jogos });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Copa Quadra 7 Online na porta ${PORT}`));