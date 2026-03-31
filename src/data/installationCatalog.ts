export interface InstallationItem {
  id: string;
  label: string;
}

export interface InstallationCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: InstallationItem[];
}

export const INSTALLATION_CATALOG: InstallationCategory[] = [
  {
    id: 'rede_ar_inst',
    title: 'Rede de ar comprimido',
    icon: 'git-branch-outline',
    color: '#7A4B8D',
    items: [],
  },
  {
    id: 'compressor_inst',
    title: 'Compressor',
    icon: 'hardware-chip-outline',
    color: '#B02540',
    items: [
      { id: 'piston', label: 'Pistão' },
      { id: 'screw', label: 'Parafuso' },
    ],
  },
  {
    id: 'instalacao_eletrica',
    title: 'Instalação Elétrica',
    icon: 'flash-outline',
    color: '#E8A917',
    items: [],
  },
  {
    id: 'instalacao_equipamentos',
    title: 'Instalação de equipamentos',
    icon: 'cog-outline',
    color: '#1B5E8F',
    items: [
      { id: 'elevador_inst', label: 'Elevador' },
      { id: 'rampa_inst', label: 'Rampa' },
      { id: 'compressor_eq', label: 'Compressor' },
      { id: 'desmontadora_inst', label: 'Desmontadora de pneus' },
      { id: 'balanceadora_inst', label: 'Balanceadora de rodas' },
    ],
  },
];
