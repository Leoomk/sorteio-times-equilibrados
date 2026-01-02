import React, { useState } from 'react';
import { Player } from '../types';
import '../App.css';

interface StatsViewProps {
    players: Player[];
    history: any[];
    onSave: (matchData: any) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ players, history, onSave }) => {
    const [view, setView] = useState<'RANKING' | 'REGISTER'>('RANKING');

    // States do Registro de Partida
    const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentStats, setCurrentStats] = useState<Record<string, { goals: number, assists: number, present: boolean }>>({});
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    // Filters e Sorting
    const [filterMonth, setFilterMonth] = useState<string>(String(new Date().getMonth() + 1)); // 1-12
    const [sortCriterion, setSortCriterion] = useState<'MATCHES' | 'GOALS' | 'ASSISTS' | 'PARTICIPATIONS'>('MATCHES');

    const handleStatChange = (playerId: string, field: 'goals' | 'assists', value: number) => {
        setCurrentStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId] || { goals: 0, assists: 0, present: false },
                [field]: Math.max(0, value),
                present: true
            }
        }));
    };

    const togglePresence = (playerId: string) => {
        setCurrentStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId] || { goals: 0, assists: 0, present: false },
                present: !prev[playerId]?.present
            }
        }));
    };

    const handleImportGame = () => {
        if (!importText.trim()) return;

        const lines = importText.split('\n');
        const foundIds: string[] = [];

        // Mapa reverso nome -> id (lowercase para facilitar match)
        const nameMap = new Map<string, string>();
        players.forEach(p => nameMap.set(p.name.toLowerCase(), p.id));

        lines.forEach(line => {
            // Remove números no início (ex: "1 -", "1.", "1 ")
            const cleanLine = line.replace(/^\d+[\s.-]+/, '').trim().toLowerCase();

            // Tenta dar match exato ou parcial
            // 1. Match Exato
            if (nameMap.has(cleanLine)) {
                foundIds.push(nameMap.get(cleanLine)!);
            } else {
                // 2. Match Parcial (ex: "Gabriel Gol" contendo "Gabriel")
                for (const [name, id] of nameMap.entries()) {
                    if (cleanLine.includes(name) || name.includes(cleanLine)) {
                        // Evitar matches muito curtos falsos (ex: "Ian" em "Adriano")
                        if (name.length > 3 && cleanLine.length > 3) {
                            foundIds.push(id);
                            break;
                        }
                    }
                }
            }
        });

        // Marcar encontrados como presentes
        const newStats = { ...currentStats };
        foundIds.forEach(id => {
            newStats[id] = { ...newStats[id] || { goals: 0, assists: 0 }, present: true };
        });

        setCurrentStats(newStats);
        setImportText('');
        setShowImport(false);
        alert(`${foundIds.length} jogadores identificados e marcados!`);
    };

    const saveMatch = () => {
        const matchRecord = {
            id: Date.now().toString(),
            date: matchDate,
            stats: currentStats
        };
        onSave(matchRecord);
        alert('Partida salva com sucesso!');
        setCurrentStats({});
        setView('RANKING');
    };

    // Ranking Calculado com Filtros
    const ranking = players.map(p => {
        let goals = 0;
        let assists = 0;
        let matches = 0;

        history.forEach((match: any) => {
            // Filtro de Mês
            const mDate = new Date(match.date);
            // Ajuste simples de timezone ou apenas pegando o mês UTC/Local? 
            // Vamos usar getMonth() local + 1. Se filterMonth for 'all', ignora.
            if (filterMonth !== 'all') {
                if (String(mDate.getMonth() + 1) !== filterMonth) return;
            }

            const stats = match.stats[p.id];
            if (stats && stats.present) {
                matches++;
                goals += stats.goals || 0;
                assists += stats.assists || 0;
            }
        });

        return {
            ...p,
            totalGoals: goals,
            totalAssists: assists,
            matches: matches,
            participations: goals + assists
        };
    }).sort((a, b) => {
        // Tie-breaker order: Selected Criterion -> Matches (Quem joga mais fica em cima se empatar resto) -> Goals -> Assists

        const diffMatches = b.matches - a.matches;
        const diffGoals = b.totalGoals - a.totalGoals;
        const diffAssists = b.totalAssists - a.totalAssists;
        const diffPart = b.participations - a.participations;

        switch (sortCriterion) {
            case 'GOALS':
                if (diffGoals !== 0) return diffGoals;
                return diffMatches;
            case 'ASSISTS':
                if (diffAssists !== 0) return diffAssists;
                return diffMatches;
            case 'PARTICIPATIONS':
                if (diffPart !== 0) return diffPart;
                return diffMatches;
            case 'MATCHES':
            default:
                if (diffMatches !== 0) return diffMatches;
                if (diffGoals !== 0) return diffGoals;
                return diffAssists;
        }
    });

    return (
        <div className="glass-card" style={{ padding: '24px', minHeight: '500px' }}>

            {/* Tabs Internas */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => setView('RANKING')}
                    className={view === 'RANKING' ? 'btn-primary' : 'btn-secondary'}
                >
                    🏆 Ranking Geral
                </button>
                <button
                    onClick={() => setView('REGISTER')}
                    className={view === 'REGISTER' ? 'btn-primary' : 'btn-secondary'}
                >
                    📝 Registrar Partida
                </button>
            </div>

            {view === 'RANKING' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span>📊</span> Classificação
                        </h3>

                        {/* Filtros em linha */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                                style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)' }}
                            >
                                <option value="all">Todo o Ano</option>
                                <option value="1">Janeiro</option>
                                <option value="2">Fevereiro</option>
                                <option value="3">Março</option>
                                <option value="4">Abril</option>
                                <option value="5">Maio</option>
                                <option value="6">Junho</option>
                                <option value="7">Julho</option>
                                <option value="8">Agosto</option>
                                <option value="9">Setembro</option>
                                <option value="10">Outubro</option>
                                <option value="11">Novembro</option>
                                <option value="12">Dezembro</option>
                            </select>
                        </div>
                    </div>

                    {/* Sorting Tabs Compactas */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                        {[
                            { id: 'MATCHES', label: 'Jogos', icon: '👕' },
                            { id: 'GOALS', label: 'Gols', icon: '⚽' },
                            { id: 'ASSISTS', label: 'Assists', icon: '👟' },
                            { id: 'PARTICIPATIONS', label: 'G + A', icon: '🔥' }
                        ].map(crit => (
                            <button
                                key={crit.id}
                                onClick={() => setSortCriterion(crit.id as any)}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: sortCriterion === crit.id ? 'var(--primary)' : 'transparent',
                                    color: sortCriterion === crit.id ? '#000' : 'var(--text-secondary)',
                                    fontWeight: sortCriterion === crit.id ? 800 : 600,
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {crit.icon} <span className="mobile-hide">{crit.label}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '12px', width: '40px' }}>#</th>
                                    <th style={{ padding: '12px' }}>Jogador</th>
                                    <th style={{ padding: '12px', textAlign: 'center', opacity: sortCriterion === 'MATCHES' ? 1 : 0.5 }}>J</th>
                                    <th style={{ padding: '12px', textAlign: 'center', opacity: sortCriterion === 'GOALS' ? 1 : 0.5 }}>⚽</th>
                                    <th style={{ padding: '12px', textAlign: 'center', opacity: sortCriterion === 'ASSISTS' ? 1 : 0.5 }}>👟</th>
                                    <th style={{ padding: '12px', textAlign: 'center', opacity: sortCriterion === 'PARTICIPATIONS' ? 1 : 0.5 }}>🔥</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((p, i) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                        <td style={{ padding: '12px', fontWeight: 800, color: i < 3 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                            {i === 0 ? '👑' : i + 1}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{p.name}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: sortCriterion === 'MATCHES' ? 800 : 400 }}>{p.matches}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--primary)', fontWeight: sortCriterion === 'GOALS' ? 800 : 400 }}>{p.totalGoals}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: 'var(--secondary)', fontWeight: sortCriterion === 'ASSISTS' ? 800 : 400 }}>{p.totalAssists}</td>
                                        <td style={{ padding: '12px', textAlign: 'center', color: '#ffd700', fontWeight: sortCriterion === 'PARTICIPATIONS' ? 800 : 400 }}>{p.participations}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span>✏️</span> Súmula
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setShowImport(!showImport)} className="btn-secondary" style={{ fontSize: '12px', padding: '8px 12px' }}>
                                📋 Colar Times
                            </button>
                            <input
                                type="date"
                                value={matchDate}
                                onChange={e => setMatchDate(e.target.value)}
                                className="input-modern"
                                style={{ width: 'auto' }}
                            />
                        </div>
                    </div>

                    {showImport && (
                        <div style={{ marginBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
                            <textarea
                                value={importText}
                                onChange={e => setImportText(e.target.value)}
                                placeholder="Cole aqui a lista dos times (ex: Time 1: João, Maria...)"
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    fontSize: '12px',
                                    marginBottom: '8px'
                                }}
                            />
                            <button onClick={handleImportGame} className="btn-primary" style={{ width: '100%' }}>
                                Processar e Marcar Presença
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '8px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                        {players.map(p => (
                            <div key={p.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: currentStats[p.id]?.present ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: currentStats[p.id]?.present ? '1px solid var(--primary)' : '1px solid transparent',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }} onClick={() => togglePresence(p.id)}>
                                    <div style={{
                                        width: '18px', height: '18px',
                                        borderRadius: '4px',
                                        border: '2px solid var(--text-secondary)',
                                        background: currentStats[p.id]?.present ? 'var(--primary)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {currentStats[p.id]?.present && <span style={{ fontSize: '12px', color: '#000' }}>✓</span>}
                                    </div>
                                    <span style={{ fontWeight: 600, opacity: currentStats[p.id]?.present ? 1 : 0.5 }}>{p.name}</span>
                                </div>

                                {currentStats[p.id]?.present && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
                                            <span style={{ fontSize: '12px' }}>⚽</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={currentStats[p.id]?.goals || 0}
                                                onChange={e => handleStatChange(p.id, 'goals', Number(e.target.value))}
                                                className="input-transparent"
                                                style={{ width: '30px', textAlign: 'center', color: 'white', fontWeight: 700, border: 'none', background: 'transparent' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: '20px' }}>
                                            <span style={{ fontSize: '12px' }}>👟</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={currentStats[p.id]?.assists || 0}
                                                onChange={e => handleStatChange(p.id, 'assists', Number(e.target.value))}
                                                className="input-transparent"
                                                style={{ width: '30px', textAlign: 'center', color: 'white', fontWeight: 700, border: 'none', background: 'transparent' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                        <button onClick={saveMatch} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                            💾 Salvar Súmula da Partida
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
