// Cluster bubble
export const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'sites',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step', ['get', 'point_count'],
      '#6BCB77',   // < 5 sites → green
      5,  '#FFD93D',   // 5-10 → yellow  
      10, '#FF6B6B',   // 10+ → red
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

// Cluster count label
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

// Unclustered point — severity color
export const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'sites',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'severity'],
      'F', '#FF6B6B',   // F grade → red
      'E', '#FFD93D',   // E grade → yellow
      '#6BCB77',        // default → green
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

// Pulse ring layer (outer glow effect)
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