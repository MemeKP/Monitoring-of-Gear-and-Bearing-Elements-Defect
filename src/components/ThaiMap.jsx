import { PROVINCE_MAP, PROVINCE_PATHS, PROVINCE_TO_SITE, SITES } from "../mock/SITES";

// (Temp.) finding the coordinates of the dot
const getSvgCoordinates = (event) => {
  const svg = event.currentTarget;
  const pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  console.log(`📍 พิกัด -> cx: ${Math.round(svgP.x)}, cy: ${Math.round(svgP.y)}`);
};

function ThaiMap({ hoveredSite, onHover, onSiteClick }) {
  return (
    <svg
      viewBox="0 0 559.571 1024.763"
      style={{ width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
      onClick={getSvgCoordinates} // get coordinates of the clicked dot
    >
      {PROVINCE_PATHS.map(({ i, d, cls }) => {
        if (cls === "water") {
          return <path key={i} d={d} fill="#B5D1F3" stroke="none" />;
        }
        const provinceName = PROVINCE_MAP[i];
        const siteId = provinceName ? PROVINCE_TO_SITE[provinceName] : null;
        const activeSiteData = SITES.find(site => site.id === hoveredSite);
        const isHovered = activeSiteData?.provinces.includes(provinceName);
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

      {/* SITES DOT */}
      {SITES.map(site => {
        const { cx, cy, color } = site.dot;
        const isHovered = hoveredSite === site.id;

        // คำนวณหาคะแนนความรุนแรงรวม (จำนวน F + E)
        // ถ้าเป็น Normal (ไม่มี grades) ค่าจะเป็น 0
        const totalDefects = site.grades?.reduce((sum, grade) => sum + grade.count, 0) || 0;

        // กำหนดขนาดวงกลม (Radius) ตามช่วงคะแนน
        let baseRadius = 3; // ค่าเริ่มต้น (สีเขียว Normal)
        if (totalDefects >= 1000) {
          baseRadius = 12; // ปัญหาเยอะมาก วงใหญ่สุด
        } else if (totalDefects >= 500) {
          baseRadius = 9;  // ปานกลาง
        } else if (totalDefects > 0) {
          baseRadius = 6;  // เริ่มมีปัญหา
        }

        return (
          <g
            key={site.id}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => onHover(site.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSiteClick(site.id)}
          >
            <circle cx={cx} cy={cy} fill={color}>
              <animate
                attributeName="r"
                values={`${baseRadius}; ${baseRadius * 2.5}; ${baseRadius}`}
                dur="2.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6; 0; 0.6"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </circle>

            <circle
              cx={cx}
              cy={cy}
              r={baseRadius}
              fill={color}
              stroke="#FFFFFF"
              strokeWidth={isHovered ? 2 : 1} // หนาขึ้นนิดนึงตอนเอาเมาส์ชี้
              style={{ transition: "stroke-width 0.3s ease" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default ThaiMap;
