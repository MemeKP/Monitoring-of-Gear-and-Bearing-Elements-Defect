export function AttentionRow({ item, onClick }) {

  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-xl transition-all duration-300 cursor-pointer bg-white shadow-sm border border-gray-100 hover:bg-[#ffcccc] hover:border-[#ffcccc]`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#546A81] group-hover:text-white transition-colors">
            {item.equipment}
          </h4>
          <p className="text-xs font-semibold mt-1 text-[#A2ADB6] group-hover:text-white/80 transition-colors">
            {item.site} · {item.meas_point} · {item.meas_date}
          </p>
          <p className="text-[10px] mt-2 font-semibold text-[#546A81] group-hover:text-white/70 transition-colors">
            Point Value
          </p>
        </div>

        {/* Grade badge */}
        <div className="ml-2 flex-shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-[#ffe5e5] text-red-500 group-hover:bg-white group-hover:text-red-500">
            {item.grade}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 h-1 rounded-full mr-4 bg-gray-100 group-hover:bg-white">
          {/* Width = point_value as a % of max (assumed 100) */}
          <div
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${Math.min(100, (item.point_value / 100) * 100)}%` }}
          />
        </div>
        <span className="text-xs text-red-500 font-bold">
          {item.point_value != null && !isNaN(item.point_value)
            ? Number(item.point_value).toFixed(1)
            : '--'}
        </span>
      </div>

      <p className="text-[10px] text-red-400 group-hover:text-red-500">
        Last check <span className="ml-2">{item.days_since_check} days ago</span>
      </p>
    </div>
  );
}