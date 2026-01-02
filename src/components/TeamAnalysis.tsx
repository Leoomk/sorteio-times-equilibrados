import React, { useState } from 'react';
import { Time } from '../utils/teamBalancer';
import { analyzeTeam, AnalysisResult } from '../utils/analysisEngine';
import { Player } from '../types';

interface TeamAnalysisProps {
    times: Time[];
}

export const TeamAnalysis: React.FC<TeamAnalysisProps> = ({ times }) => {
    const [analysis, setAnalysis] = useState<{ [teamId: string]: AnalysisResult } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    // Resetar análise quando os times mudarem (novo sorteio)
    React.useEffect(() => {
        setIsVisible(false);
        setAnalysis(null);
    }, [times]);

    const handleAnalyze = () => {
        const results: { [teamId: string]: AnalysisResult } = {};

        // Calcular média global para referência
        const allPlayers = times.flatMap(t => t.jogadores as Player[]);
        const globalAvg = allPlayers.reduce((acc, p) => acc + p.overall, 0) / allPlayers.length;

        times.forEach(time => {
            results[time.id] = analyzeTeam(time.jogadores as Player[], globalAvg);
        });
        setAnalysis(results);
        setIsVisible(true);
    };

    if (times.length === 0) return null;

    return (
        <div style={{ marginTop: '32px' }}>
            {!isVisible && (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                    <button
                        onClick={handleAnalyze}
                        className="btn-primary"
                        style={{ width: '100%', maxWidth: '300px', fontSize: '16px' }}
                    >
                        🔍 Analisar Equilíbrio dos Times
                    </button>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Clique para descobrir pontos fortes e fracos de cada escalação
                    </div>
                </div>
            )}

            {isVisible && analysis && (
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 800 }}>📊 Relatório Técnico</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleAnalyze}
                                className="btn-secondary"
                                title="Refazer análise"
                            >
                                🔄 Re-analisar
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="btn-secondary"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>

                    {/* Layout Lado a Lado Condensado */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '12px',
                        alignItems: 'stretch',
                        overflowX: 'auto'
                    }}>
                        {times.map((time) => {
                            const result = analysis[time.id];
                            if (!result) return null;

                            return (
                                <div key={time.id} className="glass-card" style={{
                                    padding: '16px',
                                    borderTop: '4px solid var(--primary)',
                                    flex: '1 1 0',
                                    minWidth: '250px',
                                    maxWidth: '400px'
                                }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
                                        {time.nome}
                                    </h4>

                                    {/* Overall Message - Novo */}
                                    {result.overallMessage && (
                                        <div style={{
                                            marginBottom: '10px',
                                            background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent)',
                                            padding: '6px',
                                            borderRadius: '4px',
                                            borderLeft: '2px solid #FFD700',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            fontStyle: 'italic',
                                            lineHeight: '1.3'
                                        }}>
                                            {result.overallMessage}
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                                        {/* Coluna 1: Observações + Sector */}
                                        <div>
                                            {/* Observações */}
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '3px', fontWeight: 700 }}>
                                                    📢 Pulo do Gato
                                                </div>
                                                <ul style={{ paddingLeft: '14px', margin: 0 }}>
                                                    {result.observations.slice(0, 2).map((obs, idx) => ( // Mostra top 2 pra economizar espaço vertical
                                                        <li key={idx} style={{ marginBottom: '3px', fontSize: '11px', lineHeight: '1.2' }}>
                                                            {obs}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Índice Defensivo */}
                                            <div>
                                                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 700 }}>
                                                    🛡️ Defesa
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 800, color: result.defensiveIndex.classification === 'Equilibrado' ? '#00FF88' : '#e0e0e0' }}>
                                                    {result.defensiveIndex.classification}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coluna 2: Setores Detalhados */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <SectorBadge label="Zaga" text={result.sectorAnalysis.defense} condensed />
                                            <SectorBadge label="Meio" text={result.sectorAnalysis.midfield} condensed />
                                            <SectorBadge label="Ataque" text={result.sectorAnalysis.attack} condensed />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const SectorBadge = ({ label, text, icon, condensed }: { label: string, text: string, icon?: string, condensed?: boolean }) => (
    <div style={{
        display: 'flex',
        gap: condensed ? '4px' : '12px',
        alignItems: 'flex-start',
        background: 'rgba(255,255,255,0.03)',
        padding: '5px',
        borderRadius: '4px'
    }}>
        {!condensed && <div style={{ fontSize: '16px' }}>{icon}</div>}
        <div>
            <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--secondary)' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '10px', lineHeight: '1.2' }}>{text}</div>
        </div>
    </div>
);
