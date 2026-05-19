import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { X } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { useParams } from 'react-router-dom'
import { useMeasurement } from '../hooks/useMeasurement.js'
import { ErrorBox, HeaderSkeleton } from '../components/SkeletonLoader.jsx';

const GraphPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { siteId, equipmentId } = useParams();
  // console.log("PARAMS:", { siteId, equipmentId });

  const { data, isLoading, isError, error } = useMeasurement(equipmentId);
  // console.log("MEASUREMENT:", data);
  // console.log("STATE RAW:", data?.state, typeof data?.state);

  const envelopedFftData = data?.envelopedFft || [];
  const peaksData = data?.peakData || [];
  const detailPeakData = data?.detailPeak || [];
  
  const allAmp = envelopedFftData.map(p => p[1]);
  // let maxHz = 0;
  const maxHz = Math.max(...envelopedFftData.map(p => p[0] || 0));

  // envelopedFftData.forEach(point => {
  //   if (point[1] > maxAmp) {
  //     maxAmp = point[1];
  //     maxHz = point[0];
  //   }
  // });

  // Use in markline
  const peakLines = peaksData.map(hz => ({
    xAxis: hz,
    lineStyle: {
      color: '#ef4444',
      type: 'solid',
      width: 1,
      opacity: 0.8
    },
    label: {
      show: true,
      position: 'top',
      formatter: '{c} Hz',
      color: '#ef4444',
      fontSize: 10
    }
  }));

  // Use in markline
  const harmonicLines = detailPeakData.map(hz => ({
    xAxis: hz,
    lineStyle: { color: '#c084fc', type: 'dashed', opacity: 0.6 },
    label: { show: false }
  }));

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e1e2d',
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: function (params) {
        // X (Hz) and Y (Amp) from real database
        const hz = params[0].value[0].toFixed(2);
        const amp = params[0].value[1].toFixed(2);
        return `f = ${hz}<br/>A = ${amp}`;
      },
      axisPointer: {
        type: 'cross',
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

        // NOT SURE!!!!!
        // markLine for showing both Peak and Harmonic line
        // markLine: {
        //   symbol: ['none', 'none'],
        //   silent: true,
        //   data: [
        //     ...harmonicLines, // เส้น Harmonic (55, 111, 166)
        //     ...peakLines,
        //     // { xAxis: maxHz, lineStyle: { color: '#a855f7', type: 'dashed' } },
        //     // { yAxis: maxAmp, lineStyle: { color: '#a855f7', type: 'dashed' } }
        //   ]
        // }
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
              <span className="bg-[#ffe5e5] text-red-500 font-bold px-3 py-1 rounded-lg text-sm">
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
              <span className="bg-[#7f1d1d] text-white px-4 py-1.5 rounded-full font-medium tracking-wide">
                {data?.measDate}
              </span>
              <span className="bg-[#7f1d1d] text-white px-4 py-1.5 rounded-full font-medium tracking-wide">
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

