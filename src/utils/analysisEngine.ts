import { Player, Position } from '../types';

export interface AnalysisResult {
    defensiveIndex: {
        score: number;
        classification: string;
        description: string;
    };
    sectorAnalysis: {
        defense: string;
        midfield: string;
        attack: string;
    };
    observations: string[];
    overallMessage?: string;
}

type AttributeName = 'chute' | 'passe' | 'velocidade' | 'marcacao' | 'dominio' | 'drible';

interface AttributeStats {
    avg: number;
    deviation: number; // Diferença da média global
}

// Calcular média de um atributo para um grupo de jogadores
const getAttributeAverage = (players: Player[], attr: AttributeName): number => {
    if (players.length === 0) return 0;
    return players.reduce((acc, p) => acc + p[attr], 0) / players.length;
};

// Análise profunda de um setor comparando com média global do time
const analyzeSectorAttributes = (
    sectorPlayers: Player[],
    allPlayers: Player[],
    relevantAttributes: AttributeName[]
): Map<AttributeName, AttributeStats> => {
    const stats = new Map<AttributeName, AttributeStats>();

    relevantAttributes.forEach(attr => {
        const sectorAvg = getAttributeAverage(sectorPlayers, attr);
        const globalAvg = getAttributeAverage(allPlayers, attr);
        stats.set(attr, {
            avg: sectorAvg,
            deviation: sectorAvg - globalAvg
        });
    });

    return stats;
};

// Gerar frase baseada em outlier específico
const generateAttributeInsight = (
    attr: AttributeName,
    stats: AttributeStats,
    sector: 'defense' | 'midfield' | 'attack'
): string | null => {
    const { avg, deviation } = stats;
    const absDeviation = Math.abs(deviation);

    // Só gerar insight se desvio for significativo (>10 pontos)
    if (absDeviation < 10) return null;

    const isHigh = deviation > 0;
    const isExtreme = absDeviation > 20;

    // Banco de frases variadas por atributo/setor/direção
    const phrases: Record<string, string[]> = {
        // DEFESA - Velocidade
        'defense_velocidade_high': [
            "Defesa veloz permite linha alta sem medo de bola nas costas.",
            "Zagueiros rápidos dominam corridas e recuperam bem.",
            "Velocidade defensiva favorece marcação pressão."
        ],
        'defense_velocidade_low': [
            "Defesa lenta exige jogo baixo e compactado.",
            "Evitar exposição — zaga pode ser ultrapassada facilmente.",
            "Recuo em bloco é essencial com essa velocidade defensiva."
        ],

        // DEFESA - Marcação
        'defense_marcacao_high': [
            "Marcação agressiva pode sufocar o ataque adversário.",
            "Defensores cascudos, difícil passar por essa muralha.",
            "Time com DNA combativo na defesa."
        ],
        'defense_marcacao_low': [
            "Marcação frouxa — atenção redobrada aos contra-ataques.",
            "Defesa porosa, evite perder bola no meio.",
            "Falta pegada defensiva, pode sofrer gols bobos."
        ],

        // DEFESA - Passe
        'defense_passe_high': [
            "Saída de bola limpa, defesa pode iniciar jogadas.",
            "Zaga com qualidade de passe favorece posse.",
            "Defensores jogadores, podem armar do fundo."
        ],
        'defense_passe_low': [
            "Passe defensivo limitado — prefira lançamentos diretos.",
            "Evite sair jogando curto, risco de erro é alto.",
            "Zaga toca mal, jogue mais vertical."
        ],

        // DEFESA - Domínio
        'defense_dominio_high': [
            "Defesa com controle de bola acima da média.",
            "Defensores seguros no domínio, constroem com calma."
        ],
        'defense_dominio_low': [
            "Domínio defensivo fraco, cuidado com passes nas costas.",
            "Zaga insegura no trato de bola."
        ],

        // MEIO - Passe
        'midfield_passe_high': [
            "Meio-campo cirúrgico, ideal para posse e toque de bola.",
            "Maestros no meio, ditam o ritmo com precisão.",
            "Qualidade de passe elite — abuse do tiki-taka.",
            "Meio técnico transforma defesa em ataque com facilidade."
        ],
        'midfield_passe_low': [
            "Passe sofrível no meio, prefira transições diretas.",
            "Meio-campo truncado, difícil encadear jogadas.",
            "Falta qualidade técnica — jogue mais vertical.",
            "Meio erra muito, minimize toques."
        ],

        // MEIO - Velocidade
        'midfield_velocidade_high': [
            "Meio veloz domina transições rápidas.",
            "Velocidade no meio permite contra-ataques fulminantes.",
            "Meio-campo cobre muito campo com essa velocidade."
        ],
        'midfield_velocidade_low': [
            "Meio lento exige jogo mais posicional.",
            "Troca de passes compensa a falta de velocidade no meio.",
            "Meio sem pernas, evite correria."
        ],

        // MEIO - Marcação
        'midfield_marcacao_high': [
            "Meio de combate, recupera bola rápido.",
            "Volantes cascudos dificultam criação adversária.",
            "Meio campo é um rolo compressor defensivo."
        ],
        'midfield_marcacao_low': [
            "Meio sem marcação — defesa ficará exposta.",
            "Falta combatividade no meio, adversário terá liberdade.",
            "Meio mole na marcação pode custar caro."
        ],

        // MEIO - Drible
        'midfield_dribble_high': [
            "Meio driblador quebra linhas adversárias.",
            "Jogadores de um contra um no meio criam superioridade.",
            "Meio habilidoso pode desequilibrar sozinho."
        ],
        'midfield_dribble_low': [
            "Meio pouco habilidoso — aposte em passes rápidos.",
            "Falta drible no meio, jogue mais coletivo."
        ],

        // ATAQUE - Chute  
        'attack_chute_high': [
            "Ataque letal, qualquer oportunidade vira gol.",
            "Poder de fogo absurdo — finalizem de longe!",
            "Atacantes finalizadores natos, chute é arma principal.",
            "Artilharia pesada, poucas chances = muitos gols."
        ],
        'attack_chute_low': [
            "Finalização fraca — crie MUITAS chances pra marcar.",
            "Ataque sem pontaria, entre com bola e tudo.",
            "Chute ruim obriga time a buscar gols de outra forma.",
            "Atacantes erram muito gol, paciência necessária."
        ],

        // ATAQUE - Drible
        'attack_drible_high': [
            "Ataque driblador rompe defesas fechadas.",
            "Um-contra-um favorável — abuse do individual.",
            "Atacantes habilidosos podem resolver sozinhos.",
            "Dribles desconcertantes criam espaços."
        ],
        'attack_drible_low': [
            "Ataque sem drible, aposte em movimentação.",
            "Pouca habilidade individual — jogue coletivo.",
            "Falta de drible limita criatividade ofensiva."
        ],

        // ATAQUE - Velocidade
        'attack_velocidade_high': [
            "Ataque-relâmpago nos contra-ataques.",
            "Velocidade ofensiva mata qualquer defesa lenta.",
            "Atacantes supersônicos exploram espaços."
        ],
        'attack_velocidade_low': [
            "Ataque lento exige jogo mais apoiado.",
            "Sem velocidade, aposte em finalizações de primeira.",
            "Falta explosão — compensem com posicionamento."
        ],

        // ATAQUE - Domínio
        'attack_dominio_high': [
            "Atacantes com ótimo controle seguram a bola.",
            "Domínio no ataque facilita jogadas elaboradas."
        ],
        'attack_dominio_low': [
            "Domínio fraco no ataque — passes têm que ser precisos.",
            "Atacantes inseguros na bola."
        ]
    };

    const key = `${sector}_${attr}_${isHigh ? 'high' : 'low'}`;
    const options = phrases[key] || [];

    if (options.length === 0) return null;

    // Priorizar frases de desvios extremos quando disponível
    const index = isExtreme ? 0 : Math.floor(Math.random() * options.length);
    return options[index];
};

// Análise profunda de setores
const analyzeDefense = (players: Player[], allPlayers: Player[]): string => {
    const defenders = players.filter(p => ['Zagueiro', 'Lateral'].includes(p.position));
    if (defenders.length === 0) return "Defesa inexistente — time exposto.";

    const stats = analyzeSectorAttributes(
        defenders,
        allPlayers,
        ['velocidade', 'marcacao', 'passe', 'dominio']
    );

    // Encontrar o atributo com maior desvio absoluto
    let maxDeviation = 0;
    let mostSignificantAttr: AttributeName | null = null;

    stats.forEach((stat, attr) => {
        if (Math.abs(stat.deviation) > Math.abs(maxDeviation)) {
            maxDeviation = stat.deviation;
            mostSignificantAttr = attr;
        }
    });

    if (mostSignificantAttr && Math.abs(maxDeviation) >= 10) {
        const insight = generateAttributeInsight(
            mostSignificantAttr,
            stats.get(mostSignificantAttr)!,
            'defense'
        );
        if (insight) return insight;
    }

    // Fallback para análise genérica
    const avgSpeed = stats.get('velocidade')?.avg || 0;
    if (avgSpeed < 55) return "Defesa lenta, jogue compacto.";
    if (avgSpeed > 75) return "Defesa veloz, pode pressionar alto.";
    return "Defesa equilibrada.";
};

const analyzeMidfield = (players: Player[], allPlayers: Player[]): string => {
    const midfielders = players.filter(p => ['Volante', 'Meio'].includes(p.position));
    if (midfielders.length === 0) return "Sem meio-campo estruturado.";

    const stats = analyzeSectorAttributes(
        midfielders,
        allPlayers,
        ['passe', 'velocidade', 'marcacao', 'drible', 'dominio']
    );

    // Encontrar atributo mais desviante
    let maxDeviation = 0;
    let mostSignificantAttr: AttributeName | null = null;

    stats.forEach((stat, attr) => {
        if (Math.abs(stat.deviation) > Math.abs(maxDeviation)) {
            maxDeviation = stat.deviation;
            mostSignificantAttr = attr;
        }
    });

    if (mostSignificantAttr && Math.abs(maxDeviation) >= 10) {
        const insight = generateAttributeInsight(
            mostSignificantAttr,
            stats.get(mostSignificantAttr)!,
            'midfield'
        );
        if (insight) return insight;
    }

    // Fallback
    const avgPass = stats.get('passe')?.avg || 0;
    if (avgPass > 80) return "Meio técnico, abuse da posse.";
    if (avgPass < 60) return "Meio limitado, jogue direto.";
    return "Meio equilibrado.";
};

const analyzeAttack = (players: Player[], allPlayers: Player[]): string => {
    const attackers = players.filter(p => p.position === 'Atacante');
    if (attackers.length === 0) return "Sem atacantes — esquema sem referência.";

    const stats = analyzeSectorAttributes(
        attackers,
        allPlayers,
        ['chute', 'drible', 'velocidade', 'dominio']
    );

    // Encontrar atributo mais desviante
    let maxDeviation = 0;
    let mostSignificantAttr: AttributeName | null = null;

    stats.forEach((stat, attr) => {
        if (Math.abs(stat.deviation) > Math.abs(maxDeviation)) {
            maxDeviation = stat.deviation;
            mostSignificantAttr = attr;
        }
    });

    if (mostSignificantAttr && Math.abs(maxDeviation) >= 10) {
        const insight = generateAttributeInsight(
            mostSignificantAttr,
            stats.get(mostSignificantAttr)!,
            'attack'
        );
        if (insight) return insight;
    }

    // Fallback
    const avgShoot = stats.get('chute')?.avg || 0;
    if (avgShoot > 80) return "Ataque finalizador, busque o gol.";
    if (avgShoot < 60) return "Finalização fraca, crie muito.";
    return "Ataque balanceado.";
};

// Índice Defensivo (mantido)
const calculateDefensiveIndex = (players: Player[]) => {
    let score = 0;

    players.forEach(p => {
        switch (p.position) {
            case 'Zagueiro': score += 4; break;
            case 'Lateral':
            case 'Volante': score += 3; break;
            case 'Meio': score += 2; break;
            case 'Atacante': score += 1; break;
        }
    });

    const outfieldPlayers = players.filter(p => p.position !== 'Goleiro');
    const avgScore = outfieldPlayers.length > 0 ? score / outfieldPlayers.length : 0;

    let classification = '';
    let description = '';

    if (avgScore < 1.8) {
        classification = 'Muito Exposto';
        description = `Time super ofensivo (${score}), vulnerável atrás.`;
    } else if (avgScore < 2.4) {
        classification = 'Faceiro';
        description = `Time leve (${score}), propõe jogo mas cuidado na defesa.`;
    } else if (avgScore < 2.9) {
        classification = 'Equilibrado';
        description = `Distribuição ideal (${score}).`;
    } else if (avgScore < 3.5) {
        classification = 'Sólido';
        description = `Time difícil de vazar (${score}).`;
    } else {
        classification = 'Retrancado';
        description = `Ônibus na área (${score}).`;
    }

    return { score, classification, description };
};

// Observações gerais (expandidas)
const generateTechnicalObservations = (players: Player[]): string[] => {
    const observations: { text: string; priority: number }[] = [];

    // Médias globais
    const avgChute = getAttributeAverage(players, 'chute');
    const avgPasse = getAttributeAverage(players, 'passe');
    const avgVel = getAttributeAverage(players, 'velocidade');
    const avgMarc = getAttributeAverage(players, 'marcacao');
    const avgDom = getAttributeAverage(players, 'dominio');
    const avgDrib = getAttributeAverage(players, 'drible');

    // Análises cruzadas e correlações
    if (avgPasse > 80 && avgVel < 60) {
        observations.push({ text: "Time técnico mas lento: a bola corre, os jogadores não.", priority: 10 });
    }

    if (avgVel > 85) {
        observations.push({ text: "Velocidade brutal — contra-ataque é a alma do negócio.", priority: 10 });
    }

    if (avgDrib > 80 && avgChute < 65) {
        observations.push({ text: "Muito drible, pouco gol — time segura mas não finaliza.", priority: 9 });
    }

    if (avgMarc < 55) {
        observations.push({ text: "Marcação pífia — time todo sem combatividade.", priority: 10 });
    }

    if (avgChute > 85) {
        observations.push({ text: "Arsenal ofensivo completo — finalizem sempre!", priority: 9 });
    }

    if (avgDom > 80) {
        observations.push({ text: "Controle de bola excelente, time seguro no domínio.", priority: 7 });
    }

    if (avgPasse < 55 && avgDrib < 55) {
        observations.push({ text: "Sem técnica — aposte na raça e marcação.", priority: 10 });
    }

    // Comparações entre setores
    const defenders = players.filter(p => ['Zagueiro', 'Lateral'].includes(p.position));
    const attackers = players.filter(p => p.position === 'Atacante');

    if (defenders.length > 0 && attackers.length > 0) {
        const defSpeed = getAttributeAverage(defenders, 'velocidade');
        const attSpeed = getAttributeAverage(attackers, 'velocidade');

        if (attSpeed - defSpeed > 20) {
            observations.push({ text: "Ataque muito mais veloz que defesa — jogue nos contra-ataques.", priority: 8 });
        }

        if (defSpeed - attSpeed > 20) {
            observations.push({ text: "Defesa mais veloz que ataque — paradoxo tático.", priority: 7 });
        }
    }

    // Composição posicional
    const numAtacantes = attackers.length;
    const numDefensores = defenders.length;

    if (numAtacantes >= 3) {
        observations.push({ text: "Formação ultra-ofensiva — vai chover gol (pros dois lados).", priority: 8 });
    }

    if (numDefensores >= 4) {
        observations.push({ text: "Muralha defensiva — time difícil de penetrar.", priority: 7 });
    }

    // Selecionar top 2 com maior prioridade, embaralhar empates
    return observations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 2)
        .map(o => o.text);
};

// Mensagem de Overall (mantida)
const analyzeOverall = (players: Player[], globalAverage: number) => {
    const teamAverage = players.reduce((acc, p) => acc + p.overall, 0) / players.length;
    const diff = teamAverage - globalAverage;

    if (diff > 2) {
        return "🏆 Elenco Estrelado — favorito na média de força!";
    } else if (diff < -2) {
        return "🔥 Desafio Aceito — média inferior, mas jogo é no campo!";
    } else {
        return "⚖️ Incerteza Total — jogo decidido nos detalhes.";
    }
};

export const analyzeTeam = (players: Player[], globalAverage: number = 70): AnalysisResult => {
    return {
        defensiveIndex: calculateDefensiveIndex(players),
        sectorAnalysis: {
            defense: analyzeDefense(players, players),
            midfield: analyzeMidfield(players, players),
            attack: analyzeAttack(players, players)
        },
        observations: generateTechnicalObservations(players),
        overallMessage: analyzeOverall(players, globalAverage)
    };
};
