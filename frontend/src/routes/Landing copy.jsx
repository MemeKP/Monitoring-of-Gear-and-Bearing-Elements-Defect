import { useState } from "react";

const SITES = [
  {
    id: "maemoh-mine",
    name: "Mae Moh Mine",
    grades: [
      { label: "F Grade", color: "#FF3B3B", count: 881, pct: 85 },
      { label: "E Grade", color: "#FFEE00", count: 51, pct: 15 },
    ],
    mapRegion: "north",
    dot: { cx: 370, cy: 312, r: 10, color: "#ED1A3B", glow: "rgba(237,26,59,0.35)" },
  },
  {
    id: "maemoh-plant",
    name: "Mae Moh Power Plant",
    grades: [
      { label: "F Grade", color: "#FF3B3B", count: 23, pct: 6 },
      { label: "E Grade", color: "#FFEE00", count: 977, pct: 93 },
    ],
    mapRegion: "north",
    dot: { cx: 386, cy: 330, r: 10, color: "#FFE605", glow: "rgba(255,230,5,0.4)" },
  },
  {
    id: "bhumibol",
    name: "Bhumibol Dam",
    grades: [
      { label: "E Grade", color: "#FFEE00", count: 900, pct: 92 },
    ],
    mapRegion: "north-central",
    dot: { cx: 313, cy: 473, r: 10, color: "#FFE605", glow: "rgba(255,230,5,0.4)" },
  },
  {
    id: "wangnoi",
    name: "Wangnoi Power Plant",
    grades: [
      { label: "E Grade", color: "#FFEE00", count: 400, pct: 45 },
    ],
    mapRegion: "central",
    dot: { cx: 449, cy: 714, r: 8, color: "#FFE605", glow: "rgba(255,230,5,0.4)" },
  },
  {
    id: "north-bkk",
    name: "North Bangkok Power Plant",
    status: "Normal",
    grades: [],
    mapRegion: "central",
    dot: { cx: 413, cy: 723, r: 8, color: "#9CFF2E", glow: "rgba(156,255,46,0.4)" },
  },
];

const REGION_PATHS = {
  north: "M 310 220 L 355 195 L 400 205 L 435 230 L 450 270 L 440 310 L 420 340 L 390 355 L 355 345 L 330 325 L 305 295 L 295 260 Z",
  "north-central": "M 240 340 L 295 295 L 330 325 L 355 345 L 390 355 L 440 310 L 460 340 L 480 390 L 470 430 L 440 450 L 410 465 L 365 470 L 320 465 L 275 445 L 245 410 L 230 375 Z",
  central: "M 230 445 L 275 445 L 320 465 L 365 470 L 410 465 L 440 450 L 470 430 L 510 450 L 535 490 L 550 535 L 545 575 L 520 610 L 490 630 L 460 645 L 420 640 L 385 625 L 350 600 L 320 570 L 295 535 L 265 500 L 230 470 Z",
  south: "M 350 600 L 385 625 L 420 640 L 450 640 L 470 660 L 480 700 L 475 740 L 460 780 L 440 820 L 420 850 L 400 865 L 380 850 L 365 815 L 360 775 L 355 735 L 348 695 L 342 660 L 338 625 Z",
  east: "M 460 645 L 490 630 L 520 610 L 550 585 L 580 575 L 610 580 L 640 600 L 650 640 L 645 680 L 630 710 L 600 720 L 565 715 L 535 700 L 505 680 L 480 660 Z",
  northeast: "M 480 390 L 520 370 L 560 355 L 600 350 L 640 365 L 670 390 L 690 425 L 695 465 L 685 505 L 660 535 L 625 555 L 585 560 L 550 545 L 520 520 L 500 490 L 490 455 L 485 420 Z",
};

function ThaiMap({ hoveredSite, onSiteHover, onSiteClick }) {
  return (
    <svg
      viewBox="170 170 650 1100"
      style={{ width: "100%", height: "100%", filter: "drop-shadow(0 8px 32px rgba(84,106,129,0.15))" }}
    >
      <defs>
        {SITES.map((s) => (
          <radialGradient key={s.id + "-glow"} id={s.id + "-glow"}>
            <stop offset="0%" stopColor={s.dot.glow} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        ))}
      </defs>

      {/* Thailand outline regions */}
      {Object.entries(REGION_PATHS).map(([region, d]) => {
        const siteInRegion = SITES.find((s) => s.mapRegion === region);
        const isHovered = siteInRegion && hoveredSite === siteInRegion.id;
        return (
          <path
            key={region}
            d={d}
            fill={isHovered ? "#7FA8C9" : "#546A81"}
            stroke="#E9F3FF"
            strokeWidth="1"
            style={{
              transition: "fill 0.3s ease, transform 0.3s ease",
              transformOrigin: "center",
              cursor: siteInRegion ? "pointer" : "default",
            }}
            onClick={() => siteInRegion && onSiteClick(siteInRegion.id)}
            onMouseEnter={() => siteInRegion && onSiteHover(siteInRegion.id)}
            onMouseLeave={() => onSiteHover(null)}
          />
        );
      })}

      {/* Background uncolored regions */}
      <path
        d="M 580 220 L 630 200 L 680 210 L 720 230 L 750 260 L 760 300 L 740 340 L 710 360 L 670 370 L 630 360 L 600 340 L 575 310 L 565 275 Z"
        fill="#B5D1F3"
        stroke="#E9F3FF"
        strokeWidth="0.5"
        opacity="0.6"
      />
      <path
        d="M 440 230 L 490 220 L 540 225 L 580 240 L 600 270 L 590 310 L 560 330 L 520 340 L 480 335 L 450 315 L 435 285 L 435 255 Z"
        fill="#B5D1F3"
        stroke="#E9F3FF"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Southern peninsula */}
      <path
        d="M 338 625 L 365 615 L 390 620 L 410 635 L 420 660 L 415 700 L 405 740 L 395 780 L 385 820 L 370 850 L 355 870 L 340 880 L 328 865 L 322 835 L 320 800 L 315 765 L 310 730 L 308 695 L 305 660 L 308 635 Z"
        fill="#B5D1F3"
        stroke="#E9F3FF"
        strokeWidth="0.5"
        opacity="0.55"
      />

      {/* Site dots with pulse animation */}
      {SITES.map((site) => {
        const isHovered = hoveredSite === site.id;
        const { cx, cy, r, color, glow } = site.dot;
        return (
          <g
            key={site.id}
            style={{ cursor: "pointer" }}
            onClick={() => onSiteClick(site.id)}
            onMouseEnter={() => onSiteHover(site.id)}
            onMouseLeave={() => onSiteHover(null)}
          >
            {/* Outer glow ring */}
            <circle
              cx={cx}
              cy={cy}
              r={isHovered ? r * 3.2 : r * 2.2}
              fill={glow}
              style={{ transition: "r 0.3s ease" }}
            />
            {/* Middle ring */}
            <circle
              cx={cx}
              cy={cy}
              r={isHovered ? r * 1.6 : r}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              opacity="0.65"
              style={{ transition: "r 0.3s ease" }}
            />
            {/* Core dot */}
            <circle
              cx={cx}
              cy={cy}
              r={isHovered ? r * 0.85 : r * 0.6}
              fill={color}
              style={{ transition: "r 0.3s ease" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function GradeBar({ grade }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: grade.color, fontSize: 10, fontFamily: "Montserrat", fontWeight: 600 }}>
          {grade.label}
        </span>
        <span style={{ color: grade.color, fontSize: 10, fontFamily: "Montserrat", fontWeight: 600 }}>
          {grade.count}
        </span>
      </div>
      <div style={{ height: 3, background: "rgba(230,243,255,0.4)", borderRadius: 2, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${grade.pct}%`,
            background: grade.color,
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function SiteCard({ site, isHovered, onHover, onView }) {
  return (
    <div
      onMouseEnter={() => onHover(site.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: isHovered
          ? "linear-gradient(90deg, #4a96f0 0%, #cce3f5 100%)"
          : "linear-gradient(90deg, #5EA7FF 0%, #DFEBF7 100%)",
        borderRadius: 15,
        border: "1px solid rgba(255,255,255,0.8)",
        padding: "14px 16px",
        marginBottom: 12,
        cursor: "pointer",
        transform: isHovered ? "translateX(-4px) scale(1.01)" : "translateX(0) scale(1)",
        boxShadow: isHovered
          ? "0 8px 32px rgba(84,106,129,0.25), 0 2px 4px rgba(255,255,255,0.4) inset"
          : "0 2px 4px rgba(255,255,255,0.4) inset, 0 -2px 4px rgba(0,0,0,0.1) inset, 10px 10px 20px white",
        backdropFilter: "blur(5px)",
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span
          style={{
            color: "white",
            fontSize: 15,
            fontFamily: "Montserrat",
            fontWeight: 700,
            letterSpacing: "0.02em",
            textShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {site.name}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onView(site.id); }}
          style={{
            background: "linear-gradient(0deg, #171717, #171717)",
            border: "1px solid #A6A6A6",
            borderRadius: 100,
            padding: "5px 14px",
            color: "#546A81",
            fontSize: 11,
            fontFamily: "Montserrat",
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            whiteSpace: "nowrap",
          }}
        >
          view
        </button>
      </div>

      {site.status ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#9CFF2E" }} />
          <span style={{ color: "#9CFF2E", fontSize: 10, fontFamily: "Montserrat", fontWeight: 600 }}>
            {site.status}
          </span>
        </div>
      ) : (
        site.grades.map((g) => <GradeBar key={g.label} grade={g} />)
      )}
    </div>
  );
}

export default function EGATDashboard() {
  const [hoveredSite, setHoveredSite] = useState(null);
  const [activePage, setActivePage] = useState("map");
  const [activeSite, setActiveSite] = useState(null);

  const handleView = (siteId) => {
    setActiveSite(SITES.find((s) => s.id === siteId));
    setActivePage("detail");
  };

  if (activePage === "detail" && activeSite) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #E9F3FF 0%, #B5D1F3 100%)",
          fontFamily: "Montserrat, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #5EA7FF 0%, #DFEBF7 100%)",
            borderRadius: 20,
            border: "1px solid white",
            padding: "40px 50px",
            maxWidth: 500,
            width: "100%",
            boxShadow: "0 20px 60px rgba(84,106,129,0.2)",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "white", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{activeSite.name}</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 28 }}>
            Gear & Bearing Elements Monitoring
          </p>
          {activeSite.status ? (
            <div
              style={{
                background: "rgba(156,255,46,0.15)",
                border: "1px solid #9CFF2E",
                borderRadius: 12,
                padding: "20px 30px",
                marginBottom: 24,
              }}
            >
              <div style={{ color: "#9CFF2E", fontSize: 18, fontWeight: 700 }}>● {activeSite.status}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 6 }}>
                All systems operating within normal parameters
              </div>
            </div>
          ) : (
            activeSite.grades.map((g) => (
              <div
                key={g.label}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: g.color, fontWeight: 700, fontSize: 13 }}>{g.label}</span>
                  <span style={{ color: g.color, fontWeight: 700, fontSize: 20 }}>{g.count}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.2)", borderRadius: 3 }}>
                  <div style={{ width: `${g.pct}%`, height: "100%", background: g.color, borderRadius: 3 }} />
                </div>
              </div>
            ))
          )}
          <button
            onClick={() => setActivePage("map")}
            style={{
              background: "linear-gradient(0deg, #171717, #171717)",
              border: "1px solid #A6A6A6",
              borderRadius: 100,
              padding: "10px 32px",
              color: "#546A81",
              fontSize: 13,
              fontFamily: "Montserrat",
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            ← Back to All Sites
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #E9F3FF 0%, #B5D1F3 100%)",
        fontFamily: "Montserrat, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: "#546A81",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          E
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#546A81", lineHeight: 1.2 }}>
            EGAT<span style={{ fontWeight: 500 }}>for</span>ALL
          </div>
          <div style={{ fontSize: 11, color: "#7A94A8", fontWeight: 500 }}>
            Monitoring of Gear and Bearing Elements Defect
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Map area */}
        <div style={{ flex: 1, padding: "20px 10px 20px 20px", position: "relative" }}>
          <ThaiMap
            hoveredSite={hoveredSite}
            onSiteHover={setHoveredSite}
            onSiteClick={handleView}
          />
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 380,
            padding: "20px 20px 20px 10px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#546A81",
              marginBottom: 16,
              paddingLeft: 4,
            }}
          >
            All sites
          </div>

          {SITES.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              isHovered={hoveredSite === site.id}
              onHover={setHoveredSite}
              onView={handleView}
            />
          ))}

          {/* Legend */}
          <div
            style={{
              marginTop: 8,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.3)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <div style={{ fontSize: 10, color: "#546A81", fontWeight: 600, marginBottom: 8 }}>LEGEND</div>
            {[
              { color: "#ED1A3B", label: "F Grade — Critical" },
              { color: "#FFE605", label: "E Grade — Warning" },
              { color: "#9CFF2E", label: "Normal — Healthy" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#7A94A8", fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(84,106,129,0.3); border-radius: 2px; }
      `}</style>
    </div>
  );
}