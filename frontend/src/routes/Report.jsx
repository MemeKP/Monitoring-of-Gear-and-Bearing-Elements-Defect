import Navbar from "../components/Navbar";
import ReactECharts from "echarts-for-react";
import { useMemo, useState } from "react";
import { useReportByFftId } from "../hooks/useReport";
import { useParams } from "react-router-dom";
import { useMeasurement } from "../hooks/useMeasurement";
import * as echarts from 'echarts';

const Report = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { equipmentId } = useParams()
  const { data: equipment } = useMeasurement(equipmentId);
  const envelopedFftData = equipment?.envelopedFft || [];
  const peaksData = equipment?.peakData || [];
  const detailPeakData = equipment?.detailPeak || [];

  const { report: rawReport, isLoading } = useReportByFftId(equipmentId);
  const report = useMemo(() => {
    if (!rawReport) return null;
    const dateSource = rawReport.updatedAt ?? rawReport.createdAt;
    return {
      title: rawReport.equipmentName ?? '—',
      kks: rawReport.kks ?? '—',
      rpm: rawReport.rpm ?? '—',
      date: dateSource
        ? new Date(dateSource).toLocaleString('th-TH', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        : '—',
      bearings: rawReport.bearings ?? [],
      findings: rawReport.findings
        ? rawReport.findings.split('\n').filter(Boolean)
        : [],
      recommendations: rawReport.recommendations
        ? rawReport.recommendations.split('\n').filter(Boolean)
        : [],
    };
  }, [rawReport]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <p className="text-[#9AA5B1] text-sm">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
        <p className="text-[#9AA5B1] text-sm">No report found for this equipment.</p>
      </div>
    );
  }


  const maxHz = envelopedFftData.length > 0
    ? Math.max(...envelopedFftData.map(p => p[0] || 0))
    : 1000;

  const peakPoints = peaksData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return {
      coord: [point[0], point[1]],
      value: point[1]
    };
  }).filter(Boolean);

  const harmonicPoints = detailPeakData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return {
      coord: [point[0], point[1]],
      value: point[1]
    };
  }).filter(Boolean);

  // Use in markline
  const peakLines = peaksData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;

    const hz = point[0];
    const amp = point[1];

    return {
      xAxis: hz,
      lineStyle: { color: '#ef4444', type: 'solid', width: 1, opacity: 0.8 },
      label: {
        show: true,
        position: 'end',
        formatter: `f: ${hz.toFixed(2)} Hz\nA: ${amp.toFixed(2)}`,
        color: '#ffffff',
        backgroundColor: '#ef4444',
        padding: [4, 8],
        borderRadius: 4,
        fontSize: 10,
        lineHeight: 14,
        align: 'center'
      }
    }
  }).filter(Boolean);

  const harmonicLines = detailPeakData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    const hz = point[0];
    const amp = point[1];

    return {
      xAxis: hz,
      lineStyle: { color: '#c084fc', type: 'dashed', opacity: 0.6 },
      label: {
        show: false,
        formatter: `f:${hz.toFixed(1)}\nA:${amp.toFixed(1)}`,
        color: '#ffff',
        fontSize: 10,
        backgroundColor: '#1e1e2d',
        padding: [3, 5],
        borderRadius: 4,
      }
    };
  }).filter(Boolean);

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgb(168, 85, 247)',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: function (params) {
        const hz = params[0].value[0].toFixed(2);
        const amp = params[0].value[1].toFixed(2);
        return `f = ${hz}<br/>A = ${amp}`;
      },
      axisPointer: {
        type: 'line', // cross
        lineStyle: { color: '#a855f7', type: 'dashed' },
        label: {
          backgroundColor: '#a855f7',
          color: '#fff',
          fontWeight: 'bold',
          formatter: function (params) {
            return params.value.toFixed(1);
          }
        }
      }
    },
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },

    xAxis: {
      type: 'value',
      min: 0,
      max: maxHz,
      interval: 75,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', margin: 15 },
      splitLine: { show: false }
    },

    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af' },
      splitLine: {
        lineStyle: { type: 'dashed', color: '#e5e7eb' }
      }
    },

    series: [
      {
        name: 'Amplitude',
        type: 'line',
        smooth: true,
        symbolSize: 0,
        lineStyle: { width: 2, color: '#a855f7' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(168, 85, 247, 0.4)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0)' }
          ])
        },
        data: envelopedFftData,
        markPoint: {
          symbol: 'circle',
          symbolSize: 8,
          data: [
            // peak 
            ...peakPoints.map(p => ({
              coord: [p.xAxis, p.yAxis],
              value: p.yAxis,
              itemStyle: { color: '#ef4444' }
            })),
            // harmonic peaks 
            ...harmonicPoints.map(p => ({
              coord: [p.coord[0], p.coord[1]],
              value: p.coord[1],
              itemStyle: { color: '#c084fc' }
            }))
          ],
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            lineHeight: 18,
            color: '#fff',
            backgroundColor: 'rgba(30,30,45,0.85)',
            padding: [4, 8],
            borderRadius: 4,
            formatter: function (params) {
              const [hz, amp] = params.data.coord;
              return `f:${hz.toFixed(1)}\nA:${amp.toFixed(1)}`;
            }
          }
        },
        markLine: {
          symbol: ['none', 'none'],
          data: [...peakLines, ...harmonicLines],
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] overflow-x-hidden">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div
        className={`transition-all duration-300 pt-14 md:pt-0  ${sidebarOpen ? "md:ml-64" : "md:ml-20"
          }`}
      >
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

          {/* Close button top right */}
          {/* <button className="absolute top-10 right-6 text-[#9AA5B1] hover:text-[#546A81] transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button> */}

          {/* HEADER */}
          <div className="text-center mb-14">
            <p className="text-[#EAB308] text-xs font-semibold tracking-widest mb-5 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#EAB308]" />
              ACTION REQUIRED
            </p>

            <h1 className="text-4xl font-extrabold text-[#546A81] tracking-wide uppercase">
              {report.title}
            </h1>

            <div className="flex flex-wrap justify-center items-center gap-4 mt-6 text-sm text-[#7B8794]">
              <div>
                <span className="font-semibold text-[#546A81]">KKS</span>{" "}
                <span className="text-[#CBD5E1]">•</span> {report.kks}
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-300" />
              <div>
                <span className="font-semibold text-[#546A81]">RPM</span>{" "}
                <span className="text-[#CBD5E1]">•</span> {report.rpm}
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-300" />
              <div>
                <span className="font-semibold text-[#546A81]">Date</span>{" "}
                <span className="text-[#CBD5E1]">•</span> {report.date}
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <hr className="border-gray-200 mb-12" />

          {/* SECTION 01 — Bearing Details */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl font-bold text-[#CBD5E1]">01</span>
              <h2 className="text-3xl font-bold text-[#546A81]">
                Bearing Details
              </h2>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="overflow-x-auto">


                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-[#EAF1F8] text-[#546A81]">
                      <th className="px-6 py-4 text-left font-semibold">Bearing no.</th>
                      <th className="px-6 py-4 text-left font-semibold">Point Brg.</th>
                      <th className="px-6 py-4 text-left font-semibold">BPFO</th>
                      <th className="px-6 py-4 text-left font-semibold">BPFI</th>
                      <th className="px-6 py-4 text-left font-semibold">BSF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.bearings.map((bearing, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-100 text-[#546A81]"
                      >
                        <td className="px-6 py-4">{bearing.bearingNo}</td>
                        <td className="px-6 py-4">{bearing.pointBrg}</td>
                        <td className="px-6 py-4">{bearing.bpfo}</td>
                        <td className="px-6 py-4">{bearing.bpfi}</td>
                        <td className="px-6 py-4">{bearing.bsf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 02 — Findings & Recommendations */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-[#CBD5E1]">02</span>
              <h2 className="text-3xl font-bold text-[#546A81]">
                Findings & Recommendations
              </h2>
            </div>

            {/* Summary card */}
            <div className="p-3 mb-4">
              {/* Title row with MMP / 4V badges */}
              <div className="flex items-center gap-3 mb-6 pl-3 border-l-2 border-[#546A81]">
                <h3 className="text-sm font-semibold text-[#546A81]">
                  {equipment.equipment}
                </h3>
                <div className="flex items-center gap-1 text-[#708DA8] text-xs font-semibold">
                  <span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.9997 21.7333C13.8219 21.7333 13.6663 21.6724 13.533 21.5506C13.3997 21.4288 13.333 21.2675 13.333 21.0666V10.9333C13.333 10.7333 13.3997 10.5724 13.533 10.4506C13.6663 10.3288 13.8219 10.2675 13.9997 10.2666C14.0441 10.2666 14.1997 10.3333 14.4663 10.4666L19.2997 15.2999C19.4108 15.411 19.4886 15.5222 19.533 15.6333C19.5775 15.7444 19.5997 15.8666 19.5997 15.9999C19.5997 16.1333 19.5775 16.2555 19.533 16.3666C19.4886 16.4777 19.4108 16.5888 19.2997 16.6999L14.4663 21.5333C14.3997 21.5999 14.3277 21.6502 14.2503 21.6839C14.173 21.7177 14.0895 21.7342 13.9997 21.7333Z" fill="#708DA8" />
                  </svg></span>
                  <span>{equipment.site}</span>
                </div>
                <div className="flex items-center gap-1 text-[#708DA8] text-xs font-semibold">
                  <span><svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.9997 21.7333C13.8219 21.7333 13.6663 21.6724 13.533 21.5506C13.3997 21.4288 13.333 21.2675 13.333 21.0666V10.9333C13.333 10.7333 13.3997 10.5724 13.533 10.4506C13.6663 10.3288 13.8219 10.2675 13.9997 10.2666C14.0441 10.2666 14.1997 10.3333 14.4663 10.4666L19.2997 15.2999C19.4108 15.411 19.4886 15.5222 19.533 15.6333C19.5775 15.7444 19.5997 15.8666 19.5997 15.9999C19.5997 16.1333 19.5775 16.2555 19.533 16.3666C19.4886 16.4777 19.4108 16.5888 19.2997 16.6999L14.4663 21.5333C14.3997 21.5999 14.3277 21.6502 14.2503 21.6839C14.173 21.7177 14.0895 21.7342 13.9997 21.7333Z" fill="#708DA8" />
                  </svg></span>
                  <span>{equipment.measPoint}</span>
                </div>
              </div>

              {/* Stats row — individual bordered boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[90px]">
                  <p className="text-xs text-[#9AA5B1] mb-1">ID</p>
                  <p className="font-bold text-[#546A81] text-base">{equipment.id}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[90px]">
                  <p className="text-xs text-[#9AA5B1] mb-1">f0</p>
                  <p className="font-bold text-[#546A81] text-base">{equipment.f0}</p>
                </div>
                <div className="border bg-white border-gray-200 rounded-lg px-4 py-3 min-w-[90px]">
                  <p className="text-xs text-[#9AA5B1] mb-1">iBeta</p>
                  <p className="font-bold text-[#546A81] text-base">{equipment.ibeta}</p>
                </div>
                <div className="border bg-white border-gray-200 rounded-lg px-4 py-3 min-w-[110px]">
                  <p className="text-xs text-[#9AA5B1] mb-1">BPFO/BPFI</p>
                  <p className="font-bold text-[#546A81] text-base"> {equipment?.bpfo || 'NaN'}/{Number(equipment.bpfo) + 10}</p>
                </div>
                <div className="border bg-white border-gray-200 rounded-lg px-4 py-3 min-w-[100px]">
                  <p className="text-xs text-[#9AA5B1] mb-1">Point Value</p>
                  <p className="font-bold text-[#546A81] text-base">{equipment.adjOptPointValue}</p>
                </div>
              </div>
            </div>

            {/* Spectrum Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <ReactECharts option={chartOption} style={{ height: 380 }} />
            </div>
          </section>

          {/* FINDINGS */}
          <section className="mb-14">
            <h2 className="text-3xl font-bold text-[#546A81] mb-8">
              Findings
            </h2>

            <ul className="space-y-6">
              {report.findings.map((item, index) => (
                <li key={index} className="flex gap-4">
                  {/* Left border line */}
                  <div className="flex flex-col items-center">
                    <div className="w-px flex-1 bg-[#CBD5E1]" />
                  </div><p className="text-[#546A81] text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* RECOMMENDATIONS */}
          <section className="pb-20">
            <h2 className="text-3xl font-bold text-[#546A81] mb-8">
              Recommendations
            </h2>

            <ul className="space-y-6">
              {report.recommendations.map((item, index) => (
                <li key={index} className="flex gap-4">
                  {/* Left border line */}
                  <div className="flex flex-col items-center">
                    <div className="w-px flex-1 bg-[#CBD5E1]" />
                  </div><p className="text-[#546A81] text-sm leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Report;