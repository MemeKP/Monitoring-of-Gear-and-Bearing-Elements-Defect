import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { X } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useParams } from 'react-router-dom'
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

  const envelopedFftData = data?.envelopedFft || [];
  const peaksData = data?.peakData || [];
  const detailPeakData = data?.detailPeak || [];
  console.log('PEAK', detailPeakData)

  const allAmp = envelopedFftData.map(p => p[1]);

  const grade = data?.grade || 'F'
  const gradeColor = GRADE_BADGE_COLORS[grade] ?? GRADE_BADGE_COLORS['F']

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
    <div className="min-h-screen ">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} relative`}>

        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 mt-4">

          {isLoading && <HeaderSkeleton />}
          {isError && <ErrorBox message={error.message} />}

          {/* HEADER CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <span
                style={{ backgroundColor: gradeColor.bg, color: gradeColor.text }}
                className="font-bold px-3 py-1 rounded-lg text-sm">
                [{data?.grade}] Spectrum
              </span>
              <h1 className="text-xl font-bold text-[#546A81]">
                {data?.equipment}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#A2ADB6] mb-4">
              <span>{data?.site}</span>
              <span>{data?.measPoint}</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#546A81] mb-6">
              <p>ID <span className="font-bold">{data?.id}</span></p>
              <p>f0 <span className="font-bold">{data?.f0}</span></p>
              <p>iBeta <span className="font-bold">{data?.ibeta}</span></p>
              <p>BPFO <span className="font-bold">{data?.bpfo}</span></p>
              <p>Point Value <span className="font-bold">{Number(data?.optPointValue || 0).toFixed(2)}
              </span></p>
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
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[500px] flex flex-col relative">
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
    </div>
  );
};

export default GraphPage;

