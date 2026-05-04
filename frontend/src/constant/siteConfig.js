/**
 * STATIC site configuration — only geography & map dot positions.
 * Grade counts / percentages come from the API, NOT from here.
 *
 * How to find cx/cy for a new site:
 *   Open the SVG map in browser → right-click → Inspect
 *   Use the onClick={getSvgCoordinates} you already have to log coordinates.
 */
export const SITE_CONFIG = [
  {
    id: "TPI",                          // must match site name in DB exactly
    name: "TPI",
    provinces: ["lampang"],             // which Thai provinces to highlight
    dot: { cx: 163, cy: 127 },         // SVG coordinates on the Thailand map
  },
  {
    id: "HPC",
    name: "HPC",
    provinces: [],                      // add provinces once you know them
    dot: { cx: 220, cy: 310 },         // update with real coordinates
  },
  {
    id: "DEM",
    name: "DEM",
    provinces: [],
    dot: { cx: 310, cy: 480 },
  },
];

/**
 * Maps province name → site id.
 * Auto-generated from SITE_CONFIG — no need to maintain separately.
 */
export const PROVINCE_TO_SITE = SITE_CONFIG.reduce((acc, site) => {
  site.provinces.forEach(province => {
    acc[province] = site.id;
  });
  return acc;
}, {});