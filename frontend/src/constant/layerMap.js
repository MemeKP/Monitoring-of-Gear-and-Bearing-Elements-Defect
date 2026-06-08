export const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'sites',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'case',
      ['>', ['get', 'sum_f'], ['get', 'sum_e']], '#FF6B6B',  // F = red
      ['>', ['get', 'sum_e'], ['get', 'sum_f']], '#FFD93D',  // E = yellow
      '#6BCB77', // equal/normal = green
    ],
    'circle-radius': [
      'step', ['get', 'point_count'], 
      20, 5, 28, 10, 36
    ],
    'circle-opacity': 0.85,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

export const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'sites',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['Open Sans Bold'],
    'text-size': 13,
  },
  paint: {
    'text-color': '#ffffff',
  },
};

export const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'sites',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'severity'],
      'F', '#FF6B6B', // F grade = red
      'E', '#FFD93D', // E grade = yellow
      '#6BCB77',// default = green
    ],
    'circle-radius': [
      'interpolate', ['linear'], ['get', 'defect_count'],
      0, 6,
      500, 10,
      1000, 14,
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.9,
  },
};

export const pulseLayer = {
  id: 'unclustered-pulse',
  type: 'circle',
  source: 'sites',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'severity'],
      'F', '#FF6B6B',
      'E', '#FFD93D',
      '#6BCB77',
    ],
    'circle-radius': [
      'interpolate', ['linear'], ['get', 'defect_count'],
      0, 12,
      500, 18,
      1000, 24,
    ],
    'circle-opacity': 0.25,
    'circle-stroke-width': 0,
  },
};