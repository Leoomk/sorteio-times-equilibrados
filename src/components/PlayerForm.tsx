import React, { useState, useEffect } from 'react';
import { Player, Position } from '../types';
import { calculateOverall } from '../utils/overallCalculator';
import '../App.css'; // Garantir que está importado para usar as classes globais

interface PlayerFormProps {
    onSubmit: (player: Player) => void;
    initialData?: Partial<Player>;
}

const POSITIONS: Position[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meio', 'Atacante'];

const PositionShortObj: Record<Position, string> = {
    'Goleiro': 'GK',
    'Zagueiro': 'DEF',
    'Lateral': 'LAT',
    'Volante': 'VOL',
    'Meio': 'MEI',
    'Atacante': 'ATK'
};

export const PlayerForm: React.FC<PlayerFormProps> = ({ onSubmit, initialData }) => {
    // Inicializar estado com initialData se existir, ou defaults
    const [player, setPlayer] = useState<Omit<Player, 'id'>>({
        name: initialData?.name || '',
        position: initialData?.position || 'Meio',
        chute: initialData?.chute || 50,
        passe: initialData?.passe || 50,
        velocidade: initialData?.velocidade || 50,
        marcacao: initialData?.marcacao || 50,
        dominio: initialData?.dominio || 50,
        drible: initialData?.drible || 50,
        overall: initialData?.overall || 50,
        mensalista: initialData?.mensalista || false
    });

    // Atualizar estado se initialData mudar (abrir modal com outro player)
    useEffect(() => {
        if (initialData) {
            setPlayer({
                name: initialData.name || '',
                position: initialData.position || 'Meio',
                chute: initialData.chute || 50,
                passe: initialData.passe || 50,
                velocidade: initialData.velocidade || 50,
                marcacao: initialData.marcacao || 50,
                dominio: initialData.dominio || 50,
                drible: initialData.drible || 50,
                overall: initialData.overall || 50,
                mensalista: initialData.mensalista || false
            });
        } else {
            // Reset se for novo
            setPlayer({
                name: '', position: 'Meio', chute: 50, passe: 50, velocidade: 50,
                marcacao: 50, dominio: 50, drible: 50, overall: 50, mensalista: false
            });
        }
    }, [initialData]);


    useEffect(() => {
        if (player.position !== 'Goleiro') {
            const tempPlayer = { ...player, id: 'temp' } as Player;
            const calcApp = calculateOverall(tempPlayer);
            if (calcApp !== player.overall) {
                setPlayer(prev => ({ ...prev, overall: calcApp }));
            }
        }
    }, [
        player.position, player.chute, player.passe,
        player.velocidade, player.marcacao, player.dominio, player.drible
    ]);

    const handleChange = (field: keyof typeof player, value: string | number | boolean) => {
        setPlayer(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!player.name) return;

        // Se initialData tem ID, mantém (edição), senão cria novo
        const newPlayer: Player = {
            ...player,
            id: initialData?.id || crypto.randomUUID(),
        };
        onSubmit(newPlayer);

        if (!initialData) {
            setPlayer(prev => ({ ...prev, name: '' })); // Reset apenas se for criação continua
        }
    };

    const isGoleiro = player.position === 'Goleiro';
    const isEditing = !!initialData?.id;

    // Inline styles for custom slider
    const getSliderStyle = () => ({
        width: '100%',
        height: '6px',
        background: 'linear-gradient(to right, #FF3D71 0%, #FFD700 50%, var(--primary) 100%)',
        borderRadius: '10px',
        outline: 'none',
        WebkitAppearance: 'none' as any,
        cursor: 'pointer'
    });

    return (
        <div style={{ padding: '0px' }}>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>NOME DO JOGADOR</label>
                    <input
                        type="text"
                        value={player.name}
                        onChange={e => handleChange('name', e.target.value)}
                        placeholder="Ex: Cristiano Ronaldo"
                        className="input-modern"
                        autoFocus
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>POSIÇÃO PREFERIDA</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {POSITIONS.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handleChange('position', p)}
                                style={{
                                    padding: '10px',
                                    background: player.position === p ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: player.position === p ? 'var(--bg-base)' : 'var(--text-secondary)',
                                    border: player.position === p ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {PositionShortObj[p]}
                            </button>
                        ))}
                    </div>
                </div>

                {!isGoleiro ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {['chute', 'passe', 'velocidade', 'drible', 'marcacao', 'dominio'].map((attr) => (
                            <div key={attr}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                                    <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{attr === 'dominio' ? 'domínio' : attr}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                                        {player[attr as keyof typeof player]}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={player[attr as keyof typeof player] as number}
                                    onChange={e => handleChange(attr as keyof typeof player, Number(e.target.value))}
                                    style={getSliderStyle()}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                            <span style={{ textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>NOTA GERAL (OVERALL)</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                                {player.overall}
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={player.overall}
                            onChange={e => handleChange('overall', Number(e.target.value))}
                            style={getSliderStyle()}
                        />
                    </div>
                )}

                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rating</span>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{player.overall}</span>
                    </div>

                    <button type="submit" className="btn-primary">
                        <span>{isEditing ? 'Salvar Alterações' : 'Adicionar Jogador'}</span>
                        <span>{isEditing ? '💾' : '➕'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
