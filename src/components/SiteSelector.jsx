/**
 * SiteCard — reusable site selector card component
 *
 * Matches the Figma design:
 * - Outer layer: gradient bg + glassmorphism shadow + backdrop-blur
 * - Inner layer: transparent white overlay with padding
 * - Site name + "view" button on top row
 * - Grade bars (F Grade / E Grade) or status dot below
 *
 * Props:
 *   name        {string}   Site display name
 *   grades      {Array}    [{ label, color, count, pct }]  — omit or [] for status mode
 *   status      {string}   e.g. "Normal" — shown instead of grades when provided
 *   isHovered   {boolean}  Controlled hover state (from parent, e.g. map sync)
 *   onHover     {fn}       (bool) => void
 *   onView      {fn}       () => void  — called when "view" is clicked
 */
export function SiteCard({ name, grades = [], status, isHovered, onHover, onView }) {
  return (
    /* ── Outer card: gradient + glassmorphism ── */
    <div
      // onMouseEnter={() => onHover?.(true)}
      // onMouseLeave={() => onHover?.(false)}
      className={[
        "relative w-full rounded-[15px] border border-white/30",
        "bg-gradient-to-r from-[#5EA7FF] to-[#DFEBF7]",
        "shadow-[10px_10px_20px_#fff,inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]",
        "backdrop-blur-[10px]",
        "transition-all duration-300 ease-out cursor-pointer"
      ].join(" ")}
      style={{ minHeight: 107 }}
    >
      {/* ── Inner overlay: transparent white container ── */}
      <div
        className="relative w-full h-full rounded-[15px] flex flex-col items-start justify-center"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: "16px 20px",
          boxSizing: "border-box",
          minHeight: 107,
        }}
      >
        {/* Top row: site name + view button */}
        <div className="flex w-full items-center justify-between mb-2">
          <span
            className="text-white font-bold tracking-wide leading-tight"
            style={{
              fontSize: 17,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textShadow: "0 1px 4px rgba(0,0,0,0.18)",
              flex: 1,
              paddingRight: 12,
            }}
          >
            {name}
          </span>

          {/* "view" button — dark pill */}
          <button
            onClick={e => { e.stopPropagation(); onView?.(); }}
            style={{
              background: "#ffff",
              // border: "1px solid #A6A6A6 ",
              borderRadius: 100,
              padding: "6px 18px",
              color: "#546A81",
              fontSize: 12,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              lineHeight: "20px",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
              boxShadow: [
                "0px 1px 8px rgba(0,0,0,0.10)",
                "0px 0px 2px rgba(0,0,0,0.10)",
                "0px 0px 8px #F2F2F2 inset",
                "0px 0px 0px 1px #A6A6A6 inset",
              ].join(", "),
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            view
          </button>
        </div>

        {/* Content: grades or status */}
        {status ? (
          /* Status dot + label */
          <div className="flex items-center gap-2 mt-1">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#9CFF2E",
                boxShadow: "0 0 6px rgba(156,255,46,0.6)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "#9CFF2E",
                fontSize: 10,
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
              }}
            >
              {status}
            </span>
          </div>
        ) : (
          /* Grade bars */
          <div className="w-full flex flex-col gap-[6px] mt-1">
            {grades.map(grade => (
              <GradeBar key={grade.label} grade={grade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Internal GradeBar ── */
function GradeBar({ grade }) {
  return (
    <div className="w-full">
      {/* Label row */}
      <div className="flex justify-between items-center mb-[3px]">
        <span
          style={{
            color: grade.color,
            fontSize: 10,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          {grade.label}
        </span>
        <span
          style={{
            color: grade.color,
            fontSize: 10,
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          {grade.count}
        </span>
      </div>

      {/* Bar track */}
      <div
        style={{
          width: "100%",
          height: 3,
          background: "rgba(230,243,255,0.35)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Bar fill */}
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

  