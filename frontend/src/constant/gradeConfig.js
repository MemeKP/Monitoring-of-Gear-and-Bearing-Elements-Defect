export const GRADE_COLORS = {
  F: { bar: 'bg-[#990000]', text: 'text-[#990000]' },
  E: { bar: 'bg-[#FFCB05]', text: 'text-[#FFCB05]' },
  D: { bar: 'bg-[#DDCF27]', text: 'text-[#DDCF27]' },
  C: { bar: 'bg-[#D2D132]', text: 'text-[#D2D132]' },
  B: { bar: 'bg-[#C7D23D]', text: 'text-[#C7D23D]' },
  A: { bar: 'bg-[#C1D343]', text: 'text-[#C1D343]' },
};

export const GRADE_FILTERS = ['F', 'E', 'D', 'C', 'B', 'A'];

export const TABLE_COLS = [
  { key: 'id',          label: 'Id',            width: 'w-16' },
  { key: 'equipment',   label: 'Name',          width: 'w-48' },
  { key: 'site',        label: 'Site',          width: 'w-20' },
  { key: 'state',       label: 'State',         width: 'w-16' },
  { key: 'meas_date',   label: 'Date',          width: 'w-28' },
  { key: 'meas_time',   label: 'Time',          width: 'w-24' },
  { key: 'meas_point',  label: 'Meas Point',    width: 'w-36' },
  { key: 'bpfo',        label: 'BPFO',          width: 'w-20' },
  { key: 'f0',          label: 'f0',            width: 'w-20' },
  { key: 'ibeta',       label: 'iBeta',         width: 'w-20' },
  { key: 'grade',       label: 'Grade',         width: 'w-20' },
  { key: 'when_action', label: 'When Actioned', width: 'w-40' },
];

export const GRADE_BADGE_COLORS = {
  F: { bg: '#FDDCDC', text: '#C0392B' },
  E: { bg: '#FFF3C7', text: '#B8860B' },
  D: { bg: '#FFE8CC', text: '#CC6600' },
  C: { bg: '#EEF7DA', text: '#4A7C00' },
  B: { bg: '#D4EDDA', text: '#155724' },
  A: { bg: '#D1ECF1', text: '#0C5460' },
};

