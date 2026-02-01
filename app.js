// Lista de amigos
let amigos = [];

// --- Voz / TTS ---
// Guardamos as vozes disponíveis e a voz escolhida (feminina pt-BR quando possível)
let vozesDisponiveis = [];
let vozSelecionada = null;
let vozHabilitadaPorInteracao = false; // navegadores exigem interação do usuário

// Tenta carregar vozes; em alguns navegadores getVoices retorna vazio inicialmente
function carregarVozes() {
  vozesDisponiveis = window.speechSynthesis.getVoices() || [];

  // tenta escolher uma voz pt-BR feminina com heurísticas
  vozSelecionada = vozesDisponiveis.find(v => {
    const nome = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();
    // preferências: pt-br && (google || female || maria || lucia etc)
    return lang === 'pt-br' && (nome.includes('google') || nome.includes('female') || nome.includes('maria') || nome.includes('luc'));
  });

  // se não achou, tenta qualquer pt-BR
  if (!vozSelecionada) {
    vozSelecionada = vozesDisponiveis.find(v => (v.lang || '').toLowerCase() === 'pt-br');
  }

  // se ainda não achou, pega primeira disponível (fallback)
  if (!vozSelecionada && vozesDisponiveis.length > 0) {
    vozSelecionada = vozesDisponiveis[0];
  }
}

// Alguns navegadores disparam 'voiceschanged' quando as vozes ficam disponíveis
if (window.speechSynthesis) {
  carregarVozes();
  window.speechSynthesis.onvoiceschanged = () => {
    carregarVozes();
  };
}

// Marca como habilitado por interação: evita bloqueios de autoplay
document.addEventListener('click', () => {
  vozHabilitadaPorInteracao = true;
}, { once: true });

// Função genérica para falar textos
function falar(texto, opts = {}) {
  if (!('speechSynthesis' in window)) {
    // Navegador não suporta Web Speech API
    console.warn('SpeechSynthesis não suportado neste navegador.');
    return;
  }

  // Só fala após interação do usuário (política de autoplay)
  if (!vozHabilitadaPorInteracao) {
    // não forçar alerta; só logamos. Usuário ativará ao clicar.
    console.warn('Interaja com a página (clique) para habilitar voz.');
    return;
  }

  // Cria a mensagem
  const utt = new SpeechSynthesisUtterance(texto);

  // Configurações padrão + overrides vindos de opts
  utt.lang = opts.lang || 'pt-BR';
  utt.rate = (typeof opts.rate === 'number') ? opts.rate : 1;    // velocidade
  utt.pitch = (typeof opts.pitch === 'number') ? opts.pitch : 1; // tom
  utt.volume = (typeof opts.volume === 'number') ? opts.volume : 1; // volume 0..1

  // Seleciona a voz já carregada (se houver)
  if (vozSelecionada) {
    utt.voice = vozSelecionada;
  }

  // Fala
  window.speechSynthesis.speak(utt);
}

// --- Fim da parte de voz ---


// Funções do jogo (mantidas / apenas com chamadas de fala adicionadas)

// Função para adicionar amigo
function adicionarAmigo() {
    const input = document.getElementById("amigo");
    const nome = input.value.trim();

    if (nome === "") {
        alert("Por favor, digite um nome válido!");
        falar("Por favor, digite um nome válido!");
        return;
    }

    amigos.push(nome);
    input.value = ""; // limpa o campo
    atualizarLista();

    // feedback de voz: confirma adição
    falar(`Amigo ${nome} adicionado à lista`);
}


// Atualiza a lista de amigos na tela
function atualizarLista() {
    const lista = document.getElementById("listaAmigos");
    lista.innerHTML = "";

    amigos.forEach((amigo) => {
        const li = document.createElement("li");
        li.textContent = amigo;
        lista.appendChild(li);
    });
}

// Função para sortear amigo secreto
function sortearAmigo() {
    if (amigos.length < 2) {
        alert("Adicione no mínimo 2 amigos para jogar!");
        falar("Adicione no mínimo dois amigos para jogar!");
        return;
    }

    const indiceSorteado = Math.floor(Math.random() * amigos.length);
    const amigoSorteado = amigos[indiceSorteado];

    const resultado = document.getElementById("resultado");
    resultado.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = `🎉 Seu amigo secreto é: ${amigoSorteado} 🎉`;
    resultado.appendChild(li);

    // feedback de voz: anuncia o resultado
    falar(`seu amigo secreto é ${amigoSorteado}`);
}

// Função para reiniciar (se você tiver um botão que chame reiniciar)
function reiniciarJogo() {
  amigos = [];
  atualizarLista();
  const resultado = document.getElementById("resultado");
  if (resultado) resultado.innerHTML = '';
  falar('Jogo reiniciado. A lista de amigos foi limpa.');
}
