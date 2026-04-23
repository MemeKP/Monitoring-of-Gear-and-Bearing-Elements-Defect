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
// export function SiteCard({ site,grades = [], status, isHovered, onHover, onView }) {
//   return (
//     /* Outer card: gradient + glassmorphism */
//     <div
//       onMouseEnter={() => onHover?.(site.id)}
//       onMouseLeave={() => onHover?.(null)}
//       className={[
//         "relative w-full rounded-[15px] border border-white/30",
//         "bg-gradient-to-r from-[#5EA7FF] to-[#DFEBF7]",
//         "shadow-[10px_10px_20px_#fff,inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]",
//         "backdrop-blur-[10px]",
//         "transition-all duration-300 ease-out cursor-pointer"
//       ].join(" ")}
//       style={{ minHeight: 107 }}
//     >
//       {/* Inner overlay: transparent white container */}
//       <div
//         className="relative w-full h-full rounded-[15px] flex flex-col items-start justify-center"
//         style={{
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           padding: "16px 20px",
//           boxSizing: "border-box",
//           minHeight: 107,
//         }}
//       >
//         {/* Top row: site name + view button */}
//         <div className="flex w-full items-center justify-between mb-2">
//           <span
//             className="text-white font-bold tracking-wide leading-tight"
//             style={{
//               fontSize: 17,
//               fontFamily: "Montserrat, sans-serif",
//               fontWeight: 700,
//               letterSpacing: "0.02em",
//               textShadow: "0 1px 4px rgba(0,0,0,0.18)",
//               flex: 1,
//               paddingRight: 12,
//             }}
//           >
//             {site.name}
//           </span>

//           {/* "view" button*/}
//           <button
//             onClick={e => { e.stopPropagation(); onView?.(); }}
//             className="button-on-light"
//             onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
//             onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
//           >
//             view
//           </button>
//         </div>

//         {/* Content: grades or status */}
//         {status ? (
//           /* Status dot + label */
//           <div className="flex items-center gap-2 mt-1">
//             <div
//               style={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: "50%",
//                 background: "#9CFF2E",
//                 boxShadow: "0 0 6px rgba(156,255,46,0.6)",
//                 flexShrink: 0,
//               }}
//             />
//             <span
//               style={{
//                 color: "#9CFF2E",
//                 fontSize: 10,
//                 fontFamily: "Montserrat, sans-serif",
//                 fontWeight: 600,
//               }}
//             >
//               {status}
//             </span>
//           </div>
//         ) : (
//           /* Grade bars */
//           grades && grades.length > 0 ?
//             (
//               <div className="w-full flex flex-col gap-[6px] mt-1">
//                 {grades.map(grade => (
//                   <GradeBar key={grade.label} grade={grade} />
//                 ))}
//               </div>
//             ) : (
//               // No 'F' nor 'E' grades
//               <div className="flex items-center gap-2 mt-2 ml-1">
//                 <div
//                   className="w-2 h-2 rounded-full flex-shrink-0"
//                   style={{
//                     background: "#9CFF2E",
//                     boxShadow: "0 0 10px rgba(156, 255, 46, 0.6)"
//                   }}
//                 />
//                 <span
//                   className="tracking-wide"
//                   style={{
//                     color: "#9CFF2E",
//                     fontFamily: "Montserrat, sans-serif",
//                     fontSize: 10,
//                     fontWeight: 600,
//                   }}
//                 >
//                   Normal
//                 </span>
//               </div>
//             )
//         )}
//       </div>
//     </div>
//   );
// }

export function SiteCard({ site, grades = [], status, isHovered, onHover, onView }) {
  return (
    <div
      className="relative w-full group mt-2 ml-2"
      onMouseEnter={() => onHover?.(site.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Layer 1: Background Glass */}
      <div
        className="absolute -top-[8px] -left-[8px] w-full h-full rounded-[15px] bg-gradient-to-r  from-[#5EA7FF] to-[#DFEBF7] backdrop-blur-md border border-white/20 z-0 "
        style={{ minHeight: 107 }}
      />

      {/* Layer 2: Main Card */}
      <div
        className={[
          "relative z-10 w-full rounded-[15px] border border-white/30",
          "bg-gradient-to-r from-[#5EA7FF] to-[#DFEBF7]",
          "shadow-[10px_10px_20px_#fff,inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]",
          "backdrop-blur-[10px]",
          "cursor-pointer"
        ].join(" ")}
        style={{ minHeight: 107 }}
      >
        <div
          className="relative w-full h-full rounded-[15px] flex flex-col items-start justify-center"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "16px 20px",
            boxSizing: "border-box",
            minHeight: 107,
          }}
        >
          {/* Top row */}
          <div className="flex w-full items-center justify-between mb-2">
            <span
              className="text-white font-bold tracking-wide leading-tight line-clamp-1"
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
              {site.name}
            </span>

            <button
              onClick={e => { e.stopPropagation(); onView?.(); }}
              className="button-on-light"
              style={{ transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              view
            </button>
          </div>

          {/* Content */}
          {status ? (
            <div className="flex items-center gap-2 mt-1">
              <div
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#9CFF2E",
                  boxShadow: "0 0 6px rgba(156,255,46,0.6)",
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#9CFF2E", fontSize: 10, fontFamily: "Montserrat, sans-serif", fontWeight: 600 }}>
                {status}
              </span>
            </div>
          ) : (
            grades && grades.length > 0 ? (
              <div className="w-full flex flex-col gap-[6px] mt-1">
                {grades.map(grade => (
                  <GradeBar key={grade.label} grade={grade} />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2 ml-1">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#9CFF2E", boxShadow: "0 0 10px rgba(156, 255, 46, 0.6)" }}
                />
                <span className="tracking-wide" style={{ color: "#9CFF2E", fontFamily: "Montserrat, sans-serif", fontSize: 10, fontWeight: 600 }}>
                  Normal
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  ); 
} 


/* ── Transparent Card ── */
export function TransparentCard({ name, grades = [], status, isHovered, onHover, site }) {
  return (
    <div
      className="rectangle-div p-4"
      onMouseEnter={() => onHover(site.id)}
      onMouseLeave={() => onHover(null)}
    >
      <span className="flex gap-5 items-center justify-between">
        <p className="text-white font-bold text-[18px]">{name}</p>
        <LiquidGlassButton />
      </span>
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
  )
}

/* ── LiquidGlass Button ── */
export function LiquidGlassButton() {
  return (
    <div>
      <button className="button-on-light text-sm">
        view
      </button>
    </div>
  )
}

/* ── INTERNAL GRADEBAR ── */
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

