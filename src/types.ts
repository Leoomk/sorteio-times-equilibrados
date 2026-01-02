export type Position = 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Volante' | 'Meio' | 'Atacante';

export interface Player {
  id: string;
  name: string;
  position: Position;
  // Atributos (0-100) - Para Goleiro, usaremos apenas 'overall' direto na UI, 
  // mas podemos manter os campos zerados ou ignorados internamente.
  chute: number;
  passe: number;
  velocidade: number;
  marcacao: number;
  dominio: number;
  drible: number;
  // Calculado ou Definido Manualmente (Goleiro)
  overall: number;
  mensalista?: boolean;
}
