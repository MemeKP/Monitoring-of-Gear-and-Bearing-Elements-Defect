import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GRADE_CONFIG } from '../constant/gradeConfig';
import { X } from 'lucide-react';
function SiteModal({ site, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const total = site.total_machines ?? 0;

  const fGrade = site.grades?.find(
    g => g.label?.[0] === 'F'
  );

  const eGrade = site.grades?.find(
    g => g.label?.[0] === 'E'
  );

  const alertGrades = [
    fGrade?.count > 0
      ? {
        key: 'F',
        count: fGrade.count,
        pct: fGrade.pct,
      }
      : null,

    eGrade?.count > 0
      ? {
        key: 'E',
        count: eGrade.count,
        pct: eGrade.pct,
      }
      : null,
  ].filter(Boolean);

  const isNormal = alertGrades.length === 0;

  const hasF = !!fGrade?.count;

  const hasE = !hasF && !!eGrade?.count;

  const accentGlow = hasF
    ? 'rgba(255,59,59,0.3)'
    : hasE
      ? 'rgba(255,203,5,0.25)'
      : 'rgba(156,255,46,0.2)';

  return (
    <>
      <style>{`
        @keyframes modal-backdrop-in {
          from { opacity: 0 }
          to { opacity: 1 }
        }

        @keyframes modal-backdrop-out {
          from { opacity: 1 }
          to { opacity: 0 }
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modal-out {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }

          to {
            opacity: 0;
            transform: scale(0.94) translateY(8px);
          }
        }

        @keyframes bar-fill {
          from { width: 0% }
          to { width: var(--bar-w) }
        }

        @keyframes liquid-shift {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>

      {/* BACKDROP */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 z-50
          flex items-center justify-center
          bg-black/50 backdrop-blur-md
          transition-all duration-300
          ${visible
            ? 'animate-[modal-backdrop-in_.28s_ease_forwards]'
            : 'animate-[modal-backdrop-out_.28s_ease_forwards]'
          }
        `}
      >
        {/* MODAL */}
        <div
          onClick={e => e.stopPropagation()}
          className={`relative overflow-hidden
            w-[280px] rounded-[24px] border border-white/20
            backdrop-blur-3xl bg-white/[0.08] shadow-2xl
            ${visible
              ? 'animate-[modal-in_.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]'
              : 'animate-[modal-out_.28s_ease_forwards]'
            }
          `}
          style={{
            boxShadow: `
              0 32px 80px rgba(0,0,0,0.55),
              0 0 0 0.5px rgba(255,255,255,0.08),
              0 0 60px ${accentGlow},
              inset 0 1px 0 rgba(255,255,255,0.25),
              inset 0 -1px 0 rgba(255,255,255,0.06)
            `,
            background: `
              linear-gradient(
                135deg,
                rgba(255,255,255,0.14) 0%,
                rgba(255,255,255,0.06) 40%,
                rgba(94,167,255,0.10) 70%,
                rgba(167,139,250,0.12) 100%
              )
            `,
          }}
        >
          {/* GLASS HIGHLIGHT */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-b
              from-white/10
              to-transparent
              pointer-events-none
            "
          />

          <div className="relative p-5 px-[22px] pb-[18px] font-[Montserrat]">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-white text-[21px] font-bold leading-tight tracking-[0.01em] drop-shadow-lg">
                  {site.displayName ?? site.id}
                </h2>

                <p className="text-white/40 text-[11px] font-medium mt-1">
                  {total > 0
                    ? `${total.toLocaleString()} machines total`
                    : 'No data'}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="
                  w-[30px] h-[30px]
                  rounded-[10px]
                  flex items-center justify-center
                  text-white/50
                  hover:text-white/80
                  transition-all duration-200
                "
              >
                <X />{/* ✕ */}
              </button>
            </div>

            {/* GRADES */}
            <div className="flex flex-col gap-[18px] mb-5">

              {isNormal ? (
                <div className="flex items-center gap-3 py-2">
                  <div
                    className="w-[9px] h-[9px] rounded-full"
                    style={{
                      background: '#9CFF2E',
                      boxShadow:
                        '0 0 10px rgba(156,255,46,0.8)',
                    }}
                  />

                  <span className="text-[#9CFF2E] text-[13px] font-semibold">
                    No critical or warning machines
                  </span>
                </div>
              ) : (
                alertGrades.map(({ key, count, pct }, i) => {
                  const cfg = GRADE_CONFIG[key];
                  const barPct =
                    total > 0
                      ? (count / total) * 100
                      : 0;

                  return (
                    <div
                      key={key}
                      className="animate-[modal-in_.4s_cubic-bezier(0.34,1.2,0.64,1)_both]"
                      style={{animationDelay: `${0.1 + i * 0.07}s`,}}
                    >
                      {/* ROW */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">

                          <span
                            className="text-[22px] font-bold leading-none"
                            style={{color: cfg.color, textShadow: `0 0 12px ${cfg.glow}`,}}
                          >
                            {key}
                          </span>

                          <span
                            className="
                              px-[9px] py-[2px]
                              rounded-full
                              text-[10px]
                              font-semibold
                              border
                              backdrop-blur-sm
                              tracking-[0.03em]
                            "
                            style={{
                              color: cfg.color,
                              background: cfg.bg,
                              borderColor: `${cfg.color}30`,
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        <span className="text-white text-[22px] font-bold leading-none drop-shadow-lg">
                          {count.toLocaleString()}
                        </span>
                      </div>

                      {/* TRACK */}
                      <div
                        className="
                          h-[5px]
                          rounded-full
                          overflow-hidden
                          bg-white/10
                        "
                        style={{
                          boxShadow:
                            'inset 0 1px 3px rgba(0,0,0,0.3)',
                        }}
                      >
                        <div
                          className=" h-full rounded-full"
                          style={{
                            '--bar-w': `${barPct.toFixed(1)}%`,
                            width: `${barPct.toFixed(1)}%`,
                            background: `linear-gradient(
                              90deg,
                              ${cfg.color}cc,
                              ${cfg.color},
                              ${cfg.color}99
                            )`,
                            backgroundSize: '200% 100%',
                            animation: `
                              bar-fill .8s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.1}s both,
                              liquid-shift 2.5s ease ${0.5 + i * 0.1}s infinite
                            `,
                            boxShadow: `
                              0 0 10px ${cfg.glow},
                              0 0 4px ${cfg.color}80
                            `,
                          }}
                        />
                      </div>

                      {/* <p className="text-white/30 text-[10px] font-medium text-right mt-[5px]">
                        {(pct ?? barPct).toFixed(1)}% of fleet
                      </p> */}
                    </div>
                  );
                })
              )}
            </div>

            {/* HINT */}
            {!isNormal && (
              <p className="text-white/20 text-[10px] text-center italic font-medium mb-4">
                See full stage breakdown on dashboard
              </p>
            )}

            {/* BUTTON */}
            <button
              onClick={() => navigate(`/dashboard/${site.id}`)}
              className="group relative w-full p-2 overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-[#203851]/50 to-[#242E29]/50 text-white font-bold tracking-wide transition-all duration-500 active:scale-[0.98]">
              {/* LIQUID SHINE */}
              {/* animate-[liquid-shift_2s_linear_infinite] add ท้าย วิบวับ */}
              <div
                className=" absolute inset-0 opacity-0 group-hover:opacity-100   transition duration-700  bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.22),transparent)]  bg-[length:200%_100%] "
              />

              {/* ICON CONTAINER */}
              <div
                className="absolute left-[6px] top-1/2 -translate-y-1/2  h-[50px] w-[45px] rounded-xl flex items-center justify-center transition-all duration-500 ease-in-out group-hover:w-[calc(100%-12px)]"
              >
                <svg
                  viewBox="0 0 320 512"
                  className=" w-[13px] h-[13px] fill-white transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3-32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z" />
                </svg>
              </div>

              {/* TEXT */}
              <span
                className="relative z-10 text-sm flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-6 "
              >
                View Dashboard
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SiteModal;