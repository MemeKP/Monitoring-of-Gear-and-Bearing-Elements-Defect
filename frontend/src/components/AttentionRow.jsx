import { GRADE_BADGE_COLORS } from "../constant/gradeConfig";

export function AttentionRow({ item, onClick }) {
  const gradeColor = GRADE_BADGE_COLORS[item.grade] || { bg: '#ffe5e5', text: '#ef4444' };

  return (
    <div
      onClick={onClick}
      style={{
        '--grade-bg': gradeColor.bg,
        '--grade-text': gradeColor.text,
      }}
      className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer bg-white shadow-sm border border-gray-100 hover:bg-[var(--grade-bg)] hover:border-[var(--grade-bg)]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#546A81] group-hover:text-[var(--grade-text)] transition-colors">
            {item.equipment}
          </h4>
          <p className="text-xs font-semibold mt-1 text-[#A2ADB6] transition-colors">
            {item.site} · {item.meas_point} · {item.meas_date}
          </p>
          <p className="text-[10px] mt-2 font-semibold text-[#546A81] transition-colors">
            Point Value
          </p>
        </div>

        {/* Grade badge */}
        <div className="ml-2 flex-shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[var(--grade-bg)] text-[var(--grade-text)] group-hover:bg-white transition-colors">
            {item.grade}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 h-1 rounded-full mr-4 bg-gray-100 group-hover:bg-white transition-colors">
          {/* Width = point_value as a % of max (assumed 100) */}
          <div
            className="h-full rounded-full bg-[var(--grade-text)] transition-colors"
            style={{ width: `${Math.min(100, (item.point_value / 100) * 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[var(--grade-text)] transition-colors">
          {item.point_value != null && !isNaN(item.point_value)
            ? Number(item.point_value).toFixed(1)
            : '--'}
        </span>
      </div>

      <p className="text-[10px] text-[var(--grade-text)] opacity-70 group-hover:opacity-100 transition-opacity">
        Last check <span className="ml-2">{item.days_since_check} days ago</span>
      </p>
    </div>
  );
}