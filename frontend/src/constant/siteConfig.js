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
    id: "TPI",                          // must match site name in DB exactly -> so, its has to add provinces once you know them
    name: "TPI",
    provinces: ["saraburi"],             // which Thai provinces to highlight
    dot: { cx: 600, cy: 500 }, 
    lat: 14.53,
    lng: 100.91       // coordinates on the map -> have to update with real coordinates
  },
  {
    id: "HPC",
    name: "HPC",
    provinces: [],                      
    dot: { cx: 122, cy: 245 },
    // lat: 13.75,
    // lng: 100.52        
  },
  {
    id: "DEM",
    name: "DEM",
    provinces: ["lampang"],
    dot: { cx: 160, cy: 132 },
    lat: 18.29,
    lng: 99.49
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