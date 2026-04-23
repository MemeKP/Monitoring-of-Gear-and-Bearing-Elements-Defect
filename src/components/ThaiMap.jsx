import { PROVINCE_MAP, PROVINCE_PATHS, PROVINCE_TO_SITE, SITES } from "../mock/SITES";

function ThaiMap({ hoveredSite, onHover, onSiteClick }) {
  return (
    <svg
      viewBox="0 0 559.571 1024.763"
      style={{ width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {PROVINCE_PATHS.map(({ i, d, cls }) => {
        if (cls === "water") {
          return <path key={i} d={d} fill="#B5D1F3" stroke="none" />;
        }
        const provinceName = PROVINCE_MAP[i];
        const siteId = provinceName ? PROVINCE_TO_SITE[provinceName] : null;
        const isHovered = siteId && hoveredSite === siteId;
        return (
          <path
            key={i}
            d={d}
            fill={isHovered ? "#546A81" : "#FFFFFF"}
            stroke="#E9F3FF"
            strokeWidth="0.5"
            style={{
              cursor: siteId ? "pointer" : "default",
              transition: "fill 0.25s ease, filter 0.25s ease",
              filter: isHovered ? "brightness(1.25)" : "none",
            }}
            onMouseEnter={() => siteId && onHover(siteId)}
            onMouseLeave={() => onHover(null)}
            onClick={() => siteId && onSiteClick(siteId)}
          />
        );
      })}

      {/* Site dots */}
      {SITES.map(site => {
        const { cx, cy, color, glow } = site.dot;
        const isHovered = hoveredSite === site.id;
        return (
          <g
            key={site.id}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(site.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSiteClick(site.id)}
          >
            {/* <circle cx={cx} cy={cy} r={isHovered ? 22 : 13} fill={glow}
              style={{ transition: "r 0.25s ease" }} />
            <circle cx={cx} cy={cy} r={isHovered ? 11 : 6} fill="none"
              stroke={color} strokeWidth="1"
              style={{ transition: "r 0.25s ease" }} />
            <circle cx={cx} cy={cy} r={isHovered ? 6.5 : 4} fill={color}
              style={{ transition: "r 0.25s ease" }} /> */}
          </g>
        );
      })}
    </svg>
  );
}

export default ThaiMap;
