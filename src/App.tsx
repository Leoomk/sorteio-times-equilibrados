import React, { useState } from 'react';
import { Player } from './types';
import { sortearTimes, Time, ModoSorteio } from './utils/teamBalancer';
import { PlayerForm } from './components/PlayerForm';
import { TeamDisplay } from './components/TeamDisplay';
import { StatsView } from './components/StatsView';
import { DataTools } from './components/DataTools';
import { PlayerCard } from './components/PlayerCard';
import { Modal } from './components/Modal';
import { useLocalStorage } from './hooks/useLocalStorage';
import './App.css';

function App() {
    const [activeTab, setActiveTab] = useState<'DRAW' | 'STATS'>('DRAW');

    // Persistência
    const [jogadores, setJogadores] = useLocalStorage<Player[]>('futebol_jogadores', []);
    const [historico, setHistorico] = useLocalStorage<any[]>('futebol_historico', []);

    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [times, setTimes] = useState<Time[]>([]);

    const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBackupHelpOpen, setIsBackupHelpOpen] = useState(false);

    // Config Sorteio
    const [modoSorteio, setModoSorteio] = useState<ModoSorteio>('NUMERO_DE_TIMES');
    const [valorSorteio, setValorSorteio] = useState<number>(2);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSavePlayer = (player: Player) => {
        if (editingPlayer?.id) {
            // Edição
            setJogadores(prev => prev.map(p => p.id === player.id ? player : p));
        } else {
            // Criação
            setJogadores(prev => [...prev, player]);
        }
        setIsModalOpen(false);
        setEditingPlayer(null);
    };

    const handleEditPlayer = (player: Player) => {
        setEditingPlayer(player);
        setIsModalOpen(true);
    };

    const handleNewPlayer = () => {
        setEditingPlayer(null);
        setIsModalOpen(true);
    };

    const handleImport = (importedPlayers: Player[]) => {
        setJogadores(prev => {
            // Criar um mapa dos novos jogadores para acesso rápido
            const importedMap = new Map(importedPlayers.map(p => [p.id, p]));

            // 1. Atualizar jogadores existentes
            const updatedExisting = prev.map(p => {
                if (importedMap.has(p.id)) {
                    return { ...p, ...importedMap.get(p.id) }; // Merge data
                }
                // Tentar match por nome se ID falhar (fallback útil)
                const matchByName = importedPlayers.find(ip => ip.name.toLowerCase() === p.name.toLowerCase());
                if (matchByName) {
                    return { ...p, ...matchByName };
                }
                return p;
            });

            // 2. Adicionar novos que não existiam (nem por ID nem por nome)
            const existingIds = new Set(updatedExisting.map(p => p.id));
            const existingNames = new Set(updatedExisting.map(p => p.name.toLowerCase()));

            const newPlayers = importedPlayers.filter(p =>
                !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase())
            );

            return [...updatedExisting, ...newPlayers];
        });
        alert('Dados atualizados com sucesso!');
    };

    const handleFullImport = (data: { players: Player[], history: any[] }) => {
        setJogadores(data.players);
        setHistorico(data.history);
    };

    const handleSaveMatch = (matchData: any) => {
        setHistorico(prev => [...prev, matchData]);
    };

    const togglePlayerSelection = (id: string) => {
        setSelectedPlayerIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleToggleMensalista = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Evitar selecionar o card ao clicar no toggle
        setJogadores(prev => prev.map(p =>
            p.id === id ? { ...p, mensalista: !p.mensalista } : p
        ));
    };

    const selectMensalistas = () => {
        const mensalistasIds = jogadores.filter(p => p.mensalista).map(p => p.id);
        setSelectedPlayerIds(prev => Array.from(new Set([...prev, ...mensalistasIds])));
    };

    const clearSelection = () => {
        setSelectedPlayerIds([]);
    };

    const handleSortear = () => {
        const pool = jogadores.filter(p => selectedPlayerIds.includes(p.id));

        if (pool.length < 2) {
            alert('Selecione pelo menos 2 jogadores!');
            return;
        }

        const timesGerados = sortearTimes(pool, {
            modo: modoSorteio,
            valor: valorSorteio
        });
        setTimes(timesGerados);

        // Scroll automático
        setTimeout(() => {
            document.getElementById('resultado-sorteio')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleLimparTudo = () => {
        if (confirm('Tem certeza? Isso apagará TODOS os jogadores cadastrados.')) {
            setJogadores([]);
            setTimes([]);
            setSelectedPlayerIds([]);
        }
    };

    // Helper de Texto para UI
    const getSorteioPreview = () => {
        const count = selectedPlayerIds.length;
        if (count === 0) return 'Selecione jogadores para começar.';

        if (modoSorteio === 'NUMERO_DE_TIMES') {
            const perTeam = Math.ceil(count / valorSorteio);
            return `Gerar ${valorSorteio} times de aprox. ${perTeam} jogadores.`;
        } else {
            const numTimes = Math.ceil(count / valorSorteio);
            return `Gerar ${numTimes} times de ${valorSorteio} jogadores.`;
        }
    };

    const filteredJogadores = jogadores.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-container bg-animated">
            <div className="field-pattern"></div>

            <aside className="sidebar">
                <div className="logo">
                    <img src="logo.png" alt="Logo" className="logo-icon" />
                    <h1 className="logo-text">Sorteador<span className="text-primary"> de Times</span></h1>
                </div>

                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setActiveTab('DRAW')} className={activeTab === 'DRAW' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '18px' }}>🎲</span> Sorteio
                    </button>
                    <button onClick={() => setActiveTab('STATS')} className={activeTab === 'STATS' ? 'btn-primary' : 'btn-secondary'} style={{ justifyContent: 'flex-start' }}>
                        <span style={{ fontSize: '18px' }}>📊</span> Rankings
                    </button>
                </div>

                {activeTab === 'DRAW' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* Card de Ações Rápidas */}
                        <div className="glass-card" style={{ padding: '20px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '16px' }}>GERENCIAR ELENCO</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* Botões unificados com mesma estética */}
                                <button onClick={selectMensalistas} className="btn-secondary" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📅</span> Selecionar Mensalistas
                                </button>

                                <button onClick={clearSelection} className="btn-secondary" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🗑️</span> Limpar Seleção
                                </button>

                                <button onClick={handleNewPlayer} className="btn-secondary" style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>➕</span> Novo Jogador
                                </button>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>BACKUP & RESTAURAÇÃO</label>
                                <button
                                    onClick={() => setIsBackupHelpOpen(true)}
                                    style={{
                                        background: 'var(--primary)',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    i
                                </button>
                            </div>
                            <div>
                                <DataTools players={jogadores} history={historico} onImport={handleFullImport} />
                            </div>
                        </div>

                        <button onClick={handleLimparTudo} style={{ fontSize: '10px', color: '#ff4444', background: 'transparent', border: 'none', textAlign: 'center', width: '100%', opacity: 0.5 }}>
                            Apagar Tudo (Reset)
                        </button>
                    </div>
                )}
            </aside>

            <main className="main-content">
                {activeTab === 'DRAW' ? (
                    <>
                        {/* Painel de Controle do Sorteio */}
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Arena de Sorteio</h2>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPlayerIds.length}</span> jogadores selecionados.
                                    </p>
                                </div>

                                {/* Divisor */}
                                <div style={{ height: '1px', background: 'var(--glass-border)', width: '100%' }}></div>

                                {/* Controles Simplificados */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    {/* Linha de Opções Centralizada */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        justifyContent: 'center',
                                        alignItems: 'stretch',
                                        flexWrap: 'wrap'
                                    }}>

                                        {/* Modos */}
                                        <div style={{ display: 'flex', gap: '8px', flex: '1 1 auto', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => setModoSorteio('NUMERO_DE_TIMES')}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: modoSorteio === 'NUMERO_DE_TIMES' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                                    background: modoSorteio === 'NUMERO_DE_TIMES' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                DIVIDIR EM TIMES
                                            </button>
                                            <button
                                                onClick={() => setModoSorteio('JOGADORES_POR_TIME')}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: modoSorteio === 'JOGADORES_POR_TIME' ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                                                    background: modoSorteio === 'JOGADORES_POR_TIME' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    color: '#fff',
                                                    fontWeight: 700,
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    minWidth: '120px'
                                                }}
                                            >
                                                JOGADORES / TIME
                                            </button>
                                        </div>

                                        {/* Quantidade */}
                                        <div style={{ flex: '0 0 auto' }}>
                                            <input
                                                type="number"
                                                min="1"
                                                value={valorSorteio}
                                                onChange={e => setValorSorteio(Number(e.target.value))}
                                                style={{
                                                    width: '80px',
                                                    height: '100%',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid var(--glass-border)',
                                                    color: '#fff',
                                                    borderRadius: '8px',
                                                    textAlign: 'center',
                                                    fontWeight: 800,
                                                    fontSize: '20px'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Botão de Ação Full Width */}
                                    <button
                                        onClick={handleSortear}
                                        className="btn-primary"
                                        disabled={selectedPlayerIds.length < 2}
                                        style={{
                                            width: '100%',
                                            padding: '18px',
                                            fontSize: '20px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '12px',
                                            opacity: selectedPlayerIds.length < 2 ? 0.5 : 1,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                    >
                                        <span>🎲</span> SORTEAR AGORA
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* GRID DE JOGADORES (FIFA STYLE) */}
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar jogador pelo nome..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-modern"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '12px'
                                }}
                            />
                        </div>

                        {filteredJogadores.length > 0 ? (
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {filteredJogadores.map(player => (
                                        <PlayerCard
                                            key={player.id}
                                            player={player}
                                            isSelected={selectedPlayerIds.includes(player.id)}
                                            onClick={() => togglePlayerSelection(player.id)}
                                            onToggleMensalista={(e) => handleToggleMensalista(e, player.id)}
                                            onEdit={() => handleEditPlayer(player)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                <h3>Nenhum jogador cadastrado.</h3>
                                <p>Use o menu lateral para adicionar ou importar.</p>
                            </div>
                        )}

                        {/* Resultado do Sorteio */}
                        <div id="resultado-sorteio">
                            {times.length > 0 && (
                                <TeamDisplay times={times} onResortear={handleSortear} />
                            )}
                        </div>
                    </>
                ) : (
                    <StatsView players={jogadores} history={historico} onSave={handleSaveMatch} />
                )}
            </main>

            {/* Modal de Edição/Criação */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingPlayer?.id ? 'Editar Jogador' : 'Novo Jogador'}
            >
                <PlayerForm
                    onSubmit={handleSavePlayer}
                    initialData={editingPlayer || undefined}
                />
            </Modal>

            {/* Modal de Ajuda do Backup */}
            <Modal
                isOpen={isBackupHelpOpen}
                onClose={() => setIsBackupHelpOpen(false)}
                title="Como funciona o salvamento?"
            >
                <div style={{ padding: '10px', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '16px', fontSize: '16px' }}>
                        📌 <strong>Pense nisso como um "Pen Drive" Digital:</strong>
                    </p>
                    <p style={{ marginBottom: '12px' }}>
                        Quando você clica em <strong>Backup</strong>, o aplicativo cria um arquivo que contém todos os jogadores e históricos que você cadastrou.
                    </p>
                    <p style={{ marginBottom: '12px' }}>
                        Se por acaso você trocar de celular, usar outro computador ou o navegador acabar limpando os dados, você não perde nada!
                    </p>
                    <p>
                        Basta clicar em <strong>Restaurar</strong> e escolher aquele arquivo que você salvou. Assim, tudo volta a ser como era antes, num passe de mágica! ✨
                    </p>

                    <button
                        onClick={() => setIsBackupHelpOpen(false)}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '24px' }}
                    >
                        Entendi!
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default App;
