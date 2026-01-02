import React, { useRef } from 'react';
import { Player } from '../types';

interface DataToolsProps {
    players: Player[];
    history: any[]; // Tiparemos melhor depois se precisar
    onImport: (data: { players: Player[]; history: any[] }) => void;
}

export const DataTools: React.FC<DataToolsProps> = ({ players, history, onImport }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            players,
            history
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Criar link temporário para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `futebol-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Validação básica
                if ((!json.players && !json.history)) {
                    alert('Arquivo de backup inválido.');
                    return;
                }

                if (confirm(`Encontrados ${json.players?.length || 0} jogadores e ${json.history?.length || 0} partidas. Importar? Isso substituirá os dados atuais.`)) {
                    onImport({
                        players: json.players || [],
                        history: json.history || []
                    });
                    alert('Dados restaurados com sucesso!');
                }

            } catch (err) {
                console.error(err);
                alert('Erro ao ler arquivo.');
            }
        };
        reader.readAsText(file);
        // Limpar input para permitir re-selecionar mesmo arquivo
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button onClick={handleExport} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>💾</span> Backup
            </button>

            <button onClick={handleImportClick} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span>📂</span> Restaurar
            </button>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                style={{ display: 'none' }}
            />
        </div>
    );
};
