const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');
const { Jogador, Capitao } = require('./models');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/copa_quadra_7';

// LISTA OFICIAL ENVIADA POR VOCÊ
const CONFIG_ESTRUTURA = [
    { nome: "Senegala 🇸🇳", capId: 3, capNome: "Murillo", jogs: [3, 32, 17, 29] },
    { nome: "Arábia Maldita 🇸🇦", capId: 46, capNome: "Prymo", jogs: [46, 15, 62, 63] },
    { nome: "Laranja Mecânica 🇳🇱", capId: 23, capNome: "Druss", jogs: [23, 25, 24, 37] },
    { nome: "Baile da Colômbia FC 🇨🇴", capId: 43, capNome: "Vara", jogs: [43, 44, 45, 18] },
    { nome: "Nicaralhos 🇳🇮", capId: 51, capNome: "Quaresma", jogs: [51, 50, 55, 56] },
    { nome: "Holaduras 🇭🇳", capId: 19, capNome: "Johksan", jogs: [19, 28, 39, 59] },
    { nome: "Complexo do Alemão 🇩🇪", capId: 2, capNome: "Câmara", jogs: [2, 33, 5, 53] },
    { nome: "Espanhola 🇪🇸", capId: 8, capNome: "Danilo", jogs: [8, 66, 65] },
    { nome: "República Xeca 🇨🇿", capId: 21, capNome: "Sarquis", jogs: [21, 20, 22, 52] }
];

async function seed() {
    try {
        await mongoose.connect(url);
        console.log("⏳ Limpando banco de dados...");
        await Jogador.deleteMany({});
        await Capitao.deleteMany({});

        const jogadoresParaInserir = [];
        const caminhoArquivo = 'Formulário sem título (respostas) - Respostas ao formulário 1.csv';

        // Lógica de leitura robusta
        fs.createReadStream(caminhoArquivo)
            .pipe(csv())
            .on('data', (row) => {
                const colunas = Object.values(row);
                
                // Mapeamento baseado no texto que você enviou:
                // [0] Carimbo, [1] Nome, [2] Posição, [3] Velocidade... [10] Geral
                const nomeRaw = colunas[1];
                
                // No seu caso, o ID não está no CSV, ele é a ORDEM das linhas.
                // Mas como você já fixou os IDs (Murillo=3, etc), precisamos de um contador
                // que comece em 2 para bater com sua lógica de ID.
            })
            // --- VAMOS USAR UMA LÓGICA DE CONTADOR PARA O ID BATER COM SUA LISTA ---
            .on('end', () => {}); // Apenas placeholder, veja a implementação real abaixo

        // RE-IMPLEMENTAÇÃO DA LEITURA COM CONTADOR DE ID COMEÇANDO EM 2
        let contadorId = 2; 
        const stream = fs.createReadStream(caminhoArquivo).pipe(csv());

        for await (const row of stream) {
            const colunas = Object.values(row);
            const nomeRaw = colunas[1];
            
            if (nomeRaw && nomeRaw.trim() !== "") {
                const idAtual = contadorId;
                jogadoresParaInserir.push({
                    nome: nomeRaw.trim(),
                    idOriginal: idAtual,
                    skill: parseInt(colunas[10]) || 0,
                    posicao: colunas[2] || 'Linha',
                    tipo: (colunas[2] && colunas[2].toLowerCase().includes('goleiro')) ? 'Goleiro' : 'Linha',
                    selecionado: CONFIG_ESTRUTURA.some(c => c.jogs.includes(idAtual))
                });
                contadorId++;
            }
        }

        if (jogadoresParaInserir.length === 0) {
            console.error("❌ Erro: Nenhum jogador processado. Verifique se o arquivo CSV está correto.");
            process.exit(1);
        }

        const todosJogs = await Jogador.insertMany(jogadoresParaInserir);
        const passwordHash = await bcrypt.hash('123', 10);

        for (let [index, config] of CONFIG_ESTRUTURA.entries()) {
            // Filtra os jogadores que o ID está na lista de 'jogs' do time
            const jogsNoTime = todosJogs.filter(j => config.jogs.includes(j.idOriginal));
            
            await Capitao.create({
                idTime: config.capId,
                nomeTime: config.nome,
                username: config.capId.toString(),
                password: passwordHash,
                capPessoa: config.capNome,
                time: jogsNoTime
            });
        }

        console.log(`✅ Sucesso! ${todosJogs.length} jogadores importados.`);
        console.log(`✅ IDs gerados de 2 até ${contadorId - 1}.`);
        console.log("✅ Times vinculados com sucesso!");
        process.exit();

    } catch (err) {
        console.error("❌ Erro fatal no seed:", err);
        process.exit(1);
    }
}

seed();