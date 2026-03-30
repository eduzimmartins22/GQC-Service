export interface Symptom {
  id: string;
  label: string;
}

export interface EquipmentSubtype {
  id: string;
  label: string;
  symptoms: Symptom[];
}

export interface EquipmentCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  subtypes: EquipmentSubtype[];
}

export const EQUIPMENT_CATALOG: EquipmentCategory[] = [
  {
    id: 'elevador',
    title: 'Elevador',
    icon: 'arrow-up-circle-outline',
    color: '#8C1C2E',
    subtypes: [
      {
        id: 'hidraulico',
        label: '1 — Hidráulico',
        symptoms: [
          { id: 'h_eletrico',       label: 'Elétrico' },
          { id: 'h_semforca',       label: 'Sem força' },
          { id: 'h_vazamento',      label: 'Com vazamento' },
          { id: 'h_bomba',          label: 'Bomba hidráulica não atua' },
        ],
      },
      {
        id: 'hidraulico_portico',
        label: '2 — Hidráulico tipo pórtico',
        symptoms: [
          { id: 'hp_eletrico',  label: 'Elétrico' },
          { id: 'hp_semforca',  label: 'Sem força' },
          { id: 'hp_vazamento', label: 'Com vazamento' },
          { id: 'hp_bomba',     label: 'Bomba hidráulica não atua' },
        ],
      },
      {
        id: 'mecanico',
        label: '3 — Elevador mecânico',
        symptoms: [
          { id: 'm_eletrico',   label: 'Elétrico' },
          { id: 'm_semforca',   label: 'Sem força' },
          { id: 'm_desnivelando', label: 'Desnivelando' },
        ],
      },
    ],
  },
  {
    id: 'compressor',
    title: 'Compressor',
    icon: 'hardware-chip-outline',
    color: '#B02540',
    subtypes: [
      {
        id: 'compressor_geral',
        label: '4 — Compressor',
        symptoms: [
          { id: 'c_redear',   label: 'Rede de ar' },
          { id: 'c_eletrico', label: 'Elétrico' },
          { id: 'c_vazamento', label: 'Vazamentos' },
          { id: 'c_semarar',  label: 'Não está gerando ar' },
        ],
      },
    ],
  },
  {
    id: 'rampa',
    title: 'Rampa',
    icon: 'car-outline',
    color: '#5E1020',
    subtypes: [
      {
        id: 'rampa_geral',
        label: '5 — Rampa',
        symptoms: [
          { id: 'r_cameras',    label: 'Câmeras não funcionam' },
          { id: 'r_descalib',   label: 'Descalibrada' },
          { id: 'r_volante',    label: 'Volante torno' },
          { id: 'r_semvideo',   label: 'Sem vídeo' },
          { id: 'r_semforca',   label: 'Sem força para levantar o carro' },
          { id: 'r_vazamento',  label: 'Vazamento de ar' },
        ],
      },
    ],
  },
  {
    id: 'desmontadora',
    title: 'Desmontadora',
    icon: 'settings-outline',
    color: '#8C1C2E',
    subtypes: [
      {
        id: 'desmont_geral',
        label: '6 — Desmontadora de pneus',
        symptoms: [
          { id: 'd_vazamento',  label: 'Vazamento de ar' },
          { id: 'd_mangueiras', label: 'Mangueiras de ar ressecadas' },
          { id: 'd_pedal',      label: 'Pedal sem funcionamento' },
        ],
      },
    ],
  },
  {
    id: 'balanceadora',
    title: 'Balanceadora',
    icon: 'speedometer-outline',
    color: '#B02540',
    subtypes: [
      {
        id: 'balanc_geral',
        label: '7 — Balanceadora de pneus',
        symptoms: [
          { id: 'b_naoliga',   label: 'Não liga' },
          { id: 'b_descalib',  label: 'Descalibrada' },
          { id: 'b_painel',    label: 'Painel com mal contato' },
        ],
      },
    ],
  },
];
