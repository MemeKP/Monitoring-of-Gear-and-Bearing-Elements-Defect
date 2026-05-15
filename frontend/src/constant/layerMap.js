/**
 * Main Responsibility:
 *  This file contains all MapLibre layer configurations used by RegionMap.
 *
 * Layer Overview:
 * 1. clusterLayer
 *    - Visual style for clustered markers
 * 2. clusterCountLayer
 *    - Displays total count inside clusters
 * 3. unclusteredPointLayer
 *    - Visual style for individual site markers
 * 4. pulseLayer
 *    - Outer glow/pulse effect behind markers
 * 
 */


/**
 * 1. clusterLayer
 * Visual layer for clustered site markers.
 * This layer renders circles representing grouped sites
 * when multiple points are close together at lower zoom levels.
 *
 * Cluster Color Logic:
 * - Red    → More F severity sites
 * - Yellow → More E severity sites
 * - Green  → Equal or normal severity
 *
 * Radius Logic:
 * Cluster size increases based on point_count.
 * More sites inside cluster = larger circle.
 */

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
      '#6BCB77',                                              // equal/normal = green
    ],
    // circle-radius, opacity, stroke 
    'circle-radius': [
      'step', ['get', 'point_count'], 
      20, 5, 28, 10, 36
    ],
    'circle-opacity': 0.85,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
};

/**
 * 2. clusterCountLayer
 *  Displays the number of sites inside each cluster.
 * 
 * Example:
 *  A cluster containing 150 points will show:
 *  "150"
 *
 *  Uses symbol layer because text rendering in MapLibre
 * is handled through symbol layers.
 */
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

/**
 * 3. unclusteredPointLayer
 *  Radius Logic: Marker size scales dynamically
 * based on defect_count.
 * More defects = larger marker.
 */
export const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'sites',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': [
      'match', ['get', 'severity'],
      'F', '#FF6B6B',   // F grade = red
      'E', '#FFD93D',   // E grade = yellow
      '#6BCB77',        // default = green
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

/**
 * 4. Pulse ring layer
 *  Outer glow effect for visibility in dark map.
 */
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