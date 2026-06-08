import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { X } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useNavigate, useParams } from 'react-router-dom'
import { useMeasurement } from '../hooks/useMeasurement.js'
import { ErrorBox, HeaderSkeleton } from '../components/SkeletonLoader.jsx';
import { GRADE_BADGE_COLORS } from '../constant/gradeConfig.js';

const GraphPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { siteId, equipmentId } = useParams();
  const { data, isLoading, isError, error } = useMeasurement(equipmentId);
  // console.log("MEASUREMENT:", data);
  // console.log("STATE RAW:", data?.state, typeof data?.state);
  const navigate = useNavigate()

  const envelopedFftData = data?.envelopedFft || [];
  const peaksData = data?.peakData || [];
  const detailPeakData = data?.detailPeak || [];
  // console.log('PEAK', detailPeakData)

  const allAmp = envelopedFftData.map(p => p[1]);

  const grade = data?.grade || 'F'
  const isGradeF = data?.grade === 'F'
  const gradeColor = GRADE_BADGE_COLORS[grade] ?? GRADE_BADGE_COLORS['F']

  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    if (data?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/reports/check/${data.id}`)
        .then((res) => res.json())
        .then((resData) => {
          setHasReport(resData.hasReport);
        })
        .catch((err) => console.error("Error checking report:", err));
    }
  }, [data?.id]);

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
    <div className="min-h-screen overflow-x-hidden">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} relative`}>
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 mt-2 sm:mt-4">
          {isLoading && <HeaderSkeleton />}
          {isError && <ErrorBox message={error.message} />}

          {/* HEADER CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 lg:mb-0">

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                <span
                  style={{ backgroundColor: gradeColor.bg, color: gradeColor.text }}
                  className="font-bold px-3 py-1 rounded-lg text-sm">
                  [{data?.grade}] Spectrum
                </span>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#546A81] break-words leading-tight">
                  {data?.equipment}
                </h1>
              </div>
              {/* Create Report F grade only */}
              <div className="flex items-center gap-3">
                {isGradeF && (
                  hasReport ? (
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/${siteId}/equipment/${equipmentId}/report-view`,
                          { state: { data } }
                        )
                      }
                      className="w-full sm:w-auto justify-center flex items-center gap-2 bg-[#708DA8] hover:bg-[#526b84]
      text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12H9m12 0A9 9 0 1112 3a9 9 0 019 9z"
                        />
                      </svg>

                      View Report
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/${siteId}/equipment/${equipmentId}/report`,
                          { state: { data } }
                        )
                      }
                      className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8]
      text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>

                      Create Report
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#A2ADB6] mb-4">
              <span>{data?.site}</span>
              <span>{data?.measPoint}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm text-[#546A81] mb-6">
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">ID</p>
                <p className="font-bold">{data?.id}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">f0</p>
                <p className="font-bold">{data?.f0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">ibeta</p>
                <p className="font-bold">{data?.ibeta}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">BPFO</p>
                <p className="font-bold">{data?.bpfo}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs text-gray-400 mb-1">Point Value</p>
                <p className="font-bold">{Number(data?.optPointValue || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2 text-xs">
              <span
                style={{ backgroundColor: gradeColor.text }}
                className="text-white py-1.5 px-2 rounded-full font-medium tracking-wide">
                {data?.measDate}
              </span>
              <span
                style={{ backgroundColor: gradeColor.text }}
                className="text-white py-1.5 px-2 rounded-full font-medium tracking-wide">
                {data?.measTime}
              </span>
            </div>
          </div>

          {/* ECHARTS GRAPH CARD */}
          <div className="bg-white rounded-2xl p-3 sm:p-5 md:p-6 shadow-sm border border-gray-100 h-[420px] sm:h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-6 flex items-center gap-4 text-sm z-10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#a855f7]"></span>
                <span className="text-gray-600">Vibration Amplitude</span>
              </div>
              {/* <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-600">Detected Peak & Harmonics</span>
              </div> */}
            </div>

            <div className="flex-1 w-full mt-6">
              <ReactECharts
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'svg' }}
                notMerge={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default GraphPage;

