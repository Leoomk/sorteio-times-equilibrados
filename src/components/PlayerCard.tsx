import React from 'react';
import { Player } from '../types';

interface PlayerCardProps {
    player: Player;
    isSelected: boolean;
    onClick: () => void;
    onToggleMensalista: (e: React.MouseEvent) => void;
    onEdit: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, onClick, onToggleMensalista, onEdit }) => {
    // Cores por posição
    // Cores por posição (Escuro para defensivo, Claro para ofensivo/lateral)
    const getPosColor = (pos: string) => {
        switch (pos) {
            case 'Goleiro': return '#fab005'; // Amarelo Ouro
            case 'Zagueiro': return '#228be6'; // Azul Escuro
            case 'Lateral': return '#4dabf7'; // Azul Claro
            case 'Volante': return '#40c057'; // Verde Escuro
            case 'Meio': return '#82c91e'; // Verde Lima/Claro
            case 'Atacante': return '#fa5252'; // Vermelho
            default: return '#ffffff';
        }
    };

    return (
        <div
            onClick={onClick}
            style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '0.7', // Formato carta
                background: isSelected
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))'
                    : 'rgba(0,0,0,0.4)',
                borderRadius: '12px',
                border: isSelected ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isSelected ? '0 0 15px rgba(0,255,136,0.3)' : 'none',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '12px',
                opacity: isSelected ? 1 : 0.6,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
            }}
        >
            {/* Botões de Ação (Mensalista e Editar) */}
            <div
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    zIndex: 20 // Garantir que fique acima de tudo no card
                }}
            >
                {/* Mensalista */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMensalista(e);
                    }}
                    title="Alternar Mensalista"
                    style={{
                        background: player.mensalista ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        color: player.mensalista ? '#00FF88' : '#fff',
                        opacity: player.mensalista ? 1 : 0.4
                    }}
                >
                    📅
                </button>

                {/* Editar */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    title="Editar Jogador"
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        color: '#fff',
                        opacity: 0.6
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                    ✏️
                </button>
            </div>

            {/* Top Info (Apenas Stats agora) */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px', fontWeight: 800, lineHeight: 1, color: getPosColor(player.position) }}>
                        {player.overall}
                    </span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 600, opacity: 0.8 }}>
                        {player.position.slice(0, 3).toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Nome e Ações */}
            <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px'
                }}>
                    {player.name}
                </div>

                {isSelected && (
                    <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>
                        CONFIRMADO
                    </div>
                )}
            </div>

            {/* Background Texture */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
        </div>
    );
};
