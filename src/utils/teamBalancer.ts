import { Player, Position } from '../types';

export interface Time {
    id: string;
    nome: string;
    jogadores: Player[];
    mediaOverall: number;
}

export type ModoSorteio = 'JOGADORES_POR_TIME' | 'NUMERO_DE_TIMES';

interface ConfigSorteio {
    modo: ModoSorteio;
    valor: number; // Pode ser qtd de jogadores OU qtd de times
}

// Fisher-Yates Shuffle para garantir aleatoriedade
function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const sortearTimes = (jogadores: Player[], config: ConfigSorteio): Time[] => {
    if (jogadores.length === 0) return [];

    // 1. Determinar o número de times
    let numTimes = 0;
    if (config.modo === 'NUMERO_DE_TIMES') {
        numTimes = config.valor;
    } else {
        numTimes = Math.ceil(jogadores.length / config.valor);
    }

    if (numTimes < 2) numTimes = 2; // Mínimo de 2 times

    // ALEATORIEDADE EXTRA: Criar timestamp único para cada sorteio
    const timestamp = Date.now();

    // Inicializar times vazios
    let times: Time[] = Array.from({ length: numTimes }, (_, i) => ({
        id: `time-${timestamp}-${i + 1}`,
        nome: `Time ${i + 1}`,
        jogadores: [],
        mediaOverall: 0
    }));

    // ALEATORIEDADE 0: Embaralhar o pool inicial de jogadores antes de separar por posição
    // Isso garante que jogadores com mesma posição e overall sejam distribuídos diferentemente
    const jogadoresEmbaralhados = shuffleArray([...jogadores]);


    // 2. Separar jogadores por Posição para garantir equilíbrio tático
    const potes: Record<Position, Player[]> = {
        'Goleiro': [],
        'Zagueiro': [],
        'Lateral': [],
        'Volante': [],
        'Meio': [],
        'Atacante': []
    };

    jogadoresEmbaralhados.forEach(p => potes[p.position].push(p));

    // ALEATORIEDADE 2: Embaralhar players DENTRO do pote para distribuição ALEATÓRIA
    // IMPORTANTE: NÃO ordenar por Overall! Isso tornaria a distribuição determinística.
    // Queremos que cada sorteio misture os jogadores de verdade, criando novas composições.
    (Object.keys(potes) as Position[]).forEach(pos => {
        shuffleArray(potes[pos]);
    });

    // 3. Distribuição "Snake Draft" (Cobra)
    // Ordem de posições ajustada para distribuir defesa e meio equilibradamente
    const ordemDistribuicao: Position[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio', 'Atacante'];

    let timeIndex = 0;
    let direction = 1; // 1 = indo (0 -> N), -1 = voltando (N -> 0)

    ordemDistribuicao.forEach(pos => {
        const jogadoresDoPote = potes[pos];

        jogadoresDoPote.forEach(jogador => {
            times[timeIndex].jogadores.push(jogador);

            // Mover índice
            timeIndex += direction;

            // Verificar limites e inverter direção (Snake)
            if (timeIndex >= numTimes) {
                timeIndex = numTimes - 1;
                direction = -1;
            } else if (timeIndex < 0) {
                timeIndex = 0;
                direction = 1;
            }
        });
    });

    // 4. Calcular médias finais e Reordenar times por Nome para exibição bonitinha (opcional, mas ajuda o usuário)
    times.forEach(t => {
        const soma = t.jogadores.reduce((acc, p) => acc + p.overall, 0);
        t.mediaOverall = t.jogadores.length > 0 ? Math.round(soma / t.jogadores.length) : 0;
    });

    // Ordenar por ID original (Time 1, Time 2...) para que a UI fique estável, só o conteúdo mude.
    times.sort((a, b) => a.nome.localeCompare(b.nome));

    return times;
};
