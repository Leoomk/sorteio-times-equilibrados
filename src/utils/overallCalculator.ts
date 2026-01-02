import { Player, Position } from '../types';

// Pesos para cálculo automático (exceto Goleiro)
const WEIGHTS: Record<Exclude<Position, 'Goleiro'>, Record<keyof Omit<Player, 'id' | 'name' | 'position' | 'overall' | 'mensalista'>, number>> = {
    'Zagueiro': {
        marcacao: 5, velocidade: 3, passe: 2, dominio: 2, chute: 1, drible: 1
    },
    'Lateral': {
        velocidade: 4, passe: 3, marcacao: 3, dominio: 2, drible: 2, chute: 1
    },
    'Volante': {
        marcacao: 4, passe: 4, dominio: 3, velocidade: 2, chute: 1, drible: 1
    },
    'Meio': {
        passe: 5, dominio: 4, drible: 3, chute: 2, velocidade: 2, marcacao: 1
    },
    'Atacante': {
        chute: 5, velocidade: 3, drible: 3, dominio: 2, passe: 1, marcacao: 1
    }
};

export const calculateOverall = (player: Player): number => {
    // Para Goleiro, assumimos que o overall já foi definido manualmente ou vem do JSON
    if (player.position === 'Goleiro') {
        return player.overall || 50;
    }

    const weights = WEIGHTS[player.position as Exclude<Position, 'Goleiro'>];

    if (!weights) return player.overall || 50;

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

    const weightedSum =
        (player.chute * weights.chute) +
        (player.passe * weights.passe) +
        (player.velocidade * weights.velocidade) +
        (player.marcacao * weights.marcacao) +
        (player.dominio * weights.dominio) +
        (player.drible * weights.drible);

    return Math.round(weightedSum / totalWeight);
};
