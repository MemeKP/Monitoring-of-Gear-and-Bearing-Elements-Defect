import ReactECharts from 'echarts-for-react';

export function StatisticOverview({ data, isLoading, isError, error }) {
  const totalMachines = data?.total_machines ?? 0;
  const defectivePct = data?.defective_pct ?? 0;
  const carefulPct = data?.careful_pct ?? 0;
  const normalPct = data?.normal_pct ?? 0;

  const chartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%',
    },
    legend: { show: false },
    graphic: [
      {
        type: 'group',
        left: 'center', 
        top: 'center',
        children: [
          // Center label: big number
          {
            type: 'text',
            z: 100, 
            x: 0, 
            y: -10,
            style: {
              text: totalMachines.toLocaleString(),
              textAlign: 'center',
              fill: '#425D78',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Montserrat, sans-serif',
            },
          },
          // Center label: "Machines" subtitle
          {
            type: 'text',
            z: 100,
            x: 0, 
            y: 15,
            style: {
              text: 'Machines',
              textAlign: 'center',
              fill: '#737373',
              fontSize: 10,
              fontFamily: 'Montserrat, sans-serif',
            },
          },
        ],
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['45%', '80%'],   // inner, outer — creates the donut hole
        center: ['50%', '50%'],   // shift left so legend has room on right
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderRadius: 0,
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          scale: true,
          scaleSize: 4,
          label: { show: false },
        },
        data: [
          {
            value: defectivePct,
            name: 'Defective',
            itemStyle: { color: '#990000'},
            
          },
          {
            value: carefulPct,
            name: 'Careful',
            itemStyle: { color: '#FFCB05' },
          },
          {
            value: normalPct,
            name: 'Normal',
            itemStyle: { color: '#C1D343' },
          },
        ],
      },
    ],
  };

  return (
    <div className="md:col-span-1 lg:col-span-1 bg-white rounded-2xl p-6 shadow-[10px_10px_20px_0px_rgba(191,202,228,1.00)] hover:shadow-[-10px_-10px_20px_0px_rgba(255,255,255,0.55)] transition h-full">
      <h3 className="text-[#546A81] font-semibold text-xl mb-2">Statistic overview</h3>
      <p className="text-gray-400 text-sm mb-6">% of fleet needing attention</p>

      {isLoading ? (
        <StatsSkeleton />
      ) : isError ? (
        <ErrorBox message={error?.message} />
      ) : (
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="relative w-40 h-40 mx-auto mb-4 shrink-0">
            <ReactECharts
              option={chartOption}
              style={{ width: '100%', height: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          </div>

          <div className="space-y-4 text-xs flex-1">
            {[
              {
                label: 'Defective',
                value: `${defectivePct.toFixed(1)} %`,
                borderColor: 'border-[#990000]',
                textColor: 'text-[#990000]',
              },
              {
                label: 'Careful',
                value: `${carefulPct.toFixed(1)} %`,
                borderColor: 'border-[#FFCB05]',
                textColor: 'text-[#FFCB05]',
              },
              {
                label: 'Normal',
                value: `${normalPct.toFixed(1)} %`,
                borderColor: 'border-[#C1D343]',
                textColor: 'text-[#C1D343]',
              },
            ].map(item => (
              <div key={item.label} className={`border-l-4 ${item.borderColor} pl-3`}>
                <p className="text-gray-500 text-sm font-normal mb-0.5">{item.label}</p>
                <p className={`${item.textColor} text-2xl whitespace-nowrap font-bold leading-tight`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-44 h-44 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-4 pt-4">
        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-200 rounded" />)}
      </div>
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-xl p-4 bg-red-50 border border-red-200">
      <p className="text-xs text-red-500 font-medium">Failed to load: {message}</p>
    </div>
  );
}