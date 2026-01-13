const mongoose = require('mongoose');

// Schema para Jogadores (Linha e Goleiros)
const JogadorSchema = new mongoose.Schema({
    idOriginal: Number,
    nome: String,
    posicao: String,
    skill: Number,
    selecionado: { type: Boolean, default: false },
    tipo: { type: String, enum: ['Linha', 'Goleiro'] }
});

// Schema para Capitães (Com dados de Login)
const CapitaoSchema = new mongoose.Schema({
    idTime: { type: Number, unique: true },
    nomeTime: String,
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Salvar com Bcrypt
    capPessoa: { type: String, default: "" },
    online: { type: Boolean, default: false },
    time: [JogadorSchema] // Array de jogadores escolhidos
});

const Jogador = mongoose.model('Jogador', JogadorSchema);
const Capitao = mongoose.model('Capitao', CapitaoSchema);

module.exports = { Jogador, Capitao };