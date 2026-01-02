import React from 'react';
import { Time } from '../utils/teamBalancer';
import { TeamAnalysis } from './TeamAnalysis';

interface TeamDisplayProps {
    times: Time[];
    onResortear?: () => void;
}

export const TeamDisplay: React.FC<TeamDisplayProps> = ({ times, onResortear }) => {

    // Ordem de posições desejada
    const positionOrder = ['Goleiro', 'Zagueiro', 'Volante', 'Lateral', 'Meio', 'Atacante'];

    // Cores por posição
    // Cores por posição
    const getPosColor = (pos: string) => {
        switch (pos) {
            case 'Goleiro': return '#fab005';
            case 'Zagueiro': return '#228be6';
            case 'Lateral': return '#4dabf7';
            case 'Volante': return '#40c057';
            case 'Meio': return '#82c91e';
            case 'Atacante': return '#fa5252';
            default: return '#ffffff';
        }
    };

    // Função helper para ordenar
    const sortPlayersByPosition = (players: any[]) => {
        return [...players].sort((a, b) => {
            const idxA = positionOrder.indexOf(a.position);
            const idxB = positionOrder.indexOf(b.position);
            if (idxA !== idxB) return idxA - idxB;
            return b.overall - a.overall; // Desempate por força
        });
    };

    // Calcular a média global para comparação
    const totalMedia = times.reduce((acc, t) => acc + t.mediaOverall, 0);
    const mediaGlobal = times.length > 0 ? Math.round(totalMedia / times.length) : 0;

    const handleExportWhatsapp = async () => {
        let text = "";

        times.forEach((time, index) => {
            text += `Time ${index + 1}:\n`;
            // Ordena por posição apenas para manter uma consistência interna, mas só exporta o nome
            const sortedPlayers = sortPlayersByPosition(time.jogadores);
            sortedPlayers.forEach((j, pIdx) => {
                text += `${pIdx + 1} - ${j.name}\n`;
            });
            text += `\n`;
        });

        try {
            await navigator.clipboard.writeText(text.trim());
            alert('Times copiados para a área de transferência!');
        } catch (err) {
            console.error('Falha ao copiar', err);
            alert('Não foi possível copiar automaticamente.');
        }
    };

    return (
        <div className="glass-card" style={{ padding: '24px', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Times Definidos
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Média de Força Global: <span style={{ color: '#fff', fontWeight: 700 }}>{mediaGlobal}</span>
                </div>
            </div>

            {/* Tactical Field View / Cards View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {times.map((time, idx) => (
                    <div key={time.id} style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header do Time */}
                        <div style={{
                            padding: '12px 16px',
                            background: idx % 2 === 0 ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'linear-gradient(90deg, rgba(0,191,255,0.1), transparent)',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)', textTransform: 'uppercase' }}>
                                    {time.nome}
                                </h4>
                            </div>
                            <div style={{
                                background: 'rgba(0,0,0,0.4)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 700
                            }}>
                                {time.mediaOverall} <span style={{ fontSize: '10px', opacity: 0.7 }}>ovR</span>
                            </div>
                        </div>

                        {/* Lista de Jogadores Compacta */}
                        <div style={{ padding: '8px 16px' }}>
                            {sortPlayersByPosition(time.jogadores).map(jogador => (
                                <div key={jogador.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '4px',
                                    paddingBottom: '4px',
                                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: getPosColor(jogador.position),
                                            color: '#000', // Texto preto para contrastar com cores neon
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                                        }}>
                                            {jogador.position.charAt(0)}
                                        </div>
                                        <span>{jogador.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{jogador.overall}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <button onClick={handleExportWhatsapp} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span>📱</span> Exportar Whatsapp
                </button>

                {onResortear && (
                    <button onClick={onResortear} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span>🔄</span> Sortear Novamente
                    </button>
                )}
            </div>

            {/* Analysis Section */}
            <TeamAnalysis times={times} />

        </div>
    );
};
