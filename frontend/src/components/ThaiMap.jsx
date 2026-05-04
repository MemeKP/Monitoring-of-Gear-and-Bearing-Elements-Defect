import { PROVINCE_TO_SITE } from "../constant/siteConfig";
import {PROVINCE_PATHS, PROVINCE_MAP} from '../mock/SITES';

// (Temp.) finding the coordinates of the dot
const getSvgCoordinates = (event) => {
  const svg = event.currentTarget;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  console.log(`coordinate -> cx: ${Math.round(svgP.x)}, cy: ${Math.round(svgP.y)}`);
};

const getSeverityStyle = (site) => {
  if (!site) return { fill: "#FFFFFF", hoverFill: "#F0F5FA" }; // if there're no site show white

  const fCount = site.grades?.find(g => g.label?.startsWith("F"))?.count || 0;
  const eCount = site.grades?.find(g => g.label?.startsWith("E"))?.count || 0;

  if (fCount >= 50) {
    return { fill: "#FFEAEA", hoverFill: "#FFD6D6" };
  } else if (fCount > 0 || eCount >= 100) {
    return { fill: "#FFF7D6", hoverFill: "#FFEAA8" };
  } else {
    return { fill: "#E8F8EE", hoverFill: "#C6EFD4" };
  }
};

function ThaiMap({ sites, provinceToSite, hoveredSite, onHover, onSiteClick }) {
  return (
    <svg
      viewBox="0 0 559.571 1024.763"
      style={{ width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
      onClick={getSvgCoordinates}
    >
      {/* 1. MAP PATHS (CHOROPLETH) */}
      {PROVINCE_PATHS.map(({ i, d, cls }) => {
        if (cls === "water") {
          return <path key={i} d={d} fill="#B5D1F3" stroke="none" />;
        }

        const provinceName = PROVINCE_MAP[i];
        const siteId = provinceName ? PROVINCE_TO_SITE[provinceName] : null;
        const siteData = siteId ? sites.find(site => site.id === siteId) : null;
        const severityColors = getSeverityStyle(siteData);

        const activeSiteData = sites.find(site => site.id === hoveredSite);
        const isHovered = activeSiteData?.provinces.includes(provinceName);

        return (
          <path
            key={i}
            d={d}
            fill={isHovered ? severityColors.hoverFill : severityColors.fill}
            stroke="#E9F3FF"
            strokeWidth="0.8"
            style={{
              cursor: siteId ? "pointer" : "default",
              transition: "fill 0.3s ease",
            }}
            onMouseEnter={() => siteId && onHover(siteId)}
            onMouseLeave={() => onHover(null)}
            onClick={() => siteId && onSiteClick(siteId)}
          />
        );
      })}

      {/* 2. SITES DOT (RADAR) */}
      {sites.map((site, index) => {
        const { cx, cy, color } = site.dot;
        const isHovered = hoveredSite === site.id;
        const totalDefects = site.grades?.reduce((sum, grade) => sum + grade.count, 0) || 0;

        let baseRadius = 3;
        if (totalDefects >= 1000) baseRadius = 12;
        else if (totalDefects >= 500) baseRadius = 9;
        else if (totalDefects > 0) baseRadius = 6;

        const dur = "2.8s";
        const delay = `${(index * 0.4) % 2.8}s`;

        return (
          <g
            key={site.id}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(site.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSiteClick(site.id)}
          >
            {/* Ring 1 */}
            <circle cx={cx} cy={cy} fill={color} opacity="0">
              <animate attributeName="r" values={`${baseRadius}; ${baseRadius * 3.5}`} dur={dur} begin={delay} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7; 0" dur={dur} begin={delay} repeatCount="indefinite" />
            </circle>

            {/* Ring 2 */}
            <circle cx={cx} cy={cy} fill={color} opacity="0">
              <animate attributeName="r" values={`${baseRadius}; ${baseRadius * 3.5}`} dur={dur} begin={`${(index * 0.4 + parseFloat(dur) / 2) % parseFloat(dur)}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5; 0" dur={dur} begin={`${(index * 0.4 + parseFloat(dur) / 2) % parseFloat(dur)}s`} repeatCount="indefinite" />
            </circle>

            {/* Core dot */}
            <circle cx={cx} cy={cy} r={isHovered ? baseRadius * 1.5 : baseRadius} fill={color} stroke="#FFFFFF" strokeWidth={isHovered ? 2 : 1} style={{ transition: "r 0.3s ease, stroke-width 0.3s ease" }} />

            {/* White center highlight */}
            <circle cx={cx} cy={cy} r={isHovered ? baseRadius * 0.55 : baseRadius * 0.45} fill="white" opacity="0.85" style={{ transition: "r 0.3s ease" }} pointerEvents="none" />
          </g>
        );
      })}
    </svg>
  );
}

export default ThaiMap;