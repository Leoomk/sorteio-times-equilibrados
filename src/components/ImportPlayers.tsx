import React, { useRef } from 'react';
import { Player } from '../types';

interface ImportPlayersProps {
    onImport: (players: Player[]) => void;
}

export const ImportPlayers: React.FC<ImportPlayersProps> = ({ onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                let parsed = JSON.parse(text);

                // Garantir que é um array
                if (!Array.isArray(parsed)) {
                    parsed = [parsed];
                }

                const validPlayers: Player[] = parsed.map((item: any) => {
                    // Detecção de formato: O formato do usuário tem "mainPosition" e "ratings"
                    const isUserFormat = item.ratings && item.mainPosition;

                    if (isUserFormat) {
                        // Mapeamento do formato do usuário para o nosso formato interno
                        const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

                        // Mapear posição: 'zagueiro' -> 'Zagueiro', 'meia' -> 'Meio'
                        let pos = capitalize(item.mainPosition || 'Atacante');

                        // Normalização específica
                        if (pos === 'Meia') pos = 'Meio';

                        return {
                            id: item.id ? String(item.id) : (Date.now() + Math.random()).toString(),
                            name: item.name || 'Desconhecido',
                            position: pos as any,
                            overall: Number(item.overall) || 50,
                            // Verificação robusta de boleano (aceita true, "true", 1, "1", "yes", etc)
                            mensalista: String(item.mensalista).toLowerCase() === 'true' || item.mensalista === true || item.mensalista === 1,
                            // Flatten ratings
                            chute: Number(item.ratings?.chute) || 0,
                            passe: Number(item.ratings?.passe) || 0,
                            velocidade: Number(item.ratings?.velocidade) || 0,
                            marcacao: Number(item.ratings?.marcacao) || 0,
                            dominio: Number(item.ratings?.dominio) || 0,
                            drible: Number(item.ratings?.drible) || 0
                        };
                    } else {
                        // Tentar formato nativo (já compatível)
                        return {
                            id: item.id ? String(item.id) : (Date.now() + Math.random()).toString(),
                            name: item.name || 'Desconhecido',
                            position: item.position || 'Atacante',
                            overall: Number(item.overall) || 50,
                            chute: Number(item.chute) || 0,
                            passe: Number(item.passe) || 0,
                            velocidade: Number(item.velocidade) || 0,
                            marcacao: Number(item.marcacao) || 0,
                            dominio: Number(item.dominio) || 0,
                            drible: Number(item.drible) || 0
                        };
                    }
                });

                if (validPlayers.length > 0) {
                    onImport(validPlayers);
                    alert(`${validPlayers.length} jogadores importados com sucesso!`);
                } else {
                    alert('Nenhum jogador válido encontrado no arquivo.');
                }
            } catch (err) {
                console.error(err);
                alert('Erro ao ler o arquivo JSON. Verifique a formatação.');
            }
        };
        reader.readAsText(file);
        // Reset para permitir importar o mesmo arquivo novamente se necessário
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '12px' }}
            >
                📂 Importar Jogadores (JSON)
            </button>
            <p style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Suporta formato padrão e formato "Ratings Detalhados".
            </p>
        </div>
    );
};
