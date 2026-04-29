import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { X } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const spectrumData = [
  { hz: '0', a: 10 },
  { hz: '75', a: 25 },
  { hz: '152', a: 122 }, 
  { hz: '225', a: 35 },
  { hz: '304', a: 105 },
  { hz: '375', a: 20 },
  { hz: '456', a: 60 },
  { hz: '525', a: 22 },
  { hz: '609', a: 45 },
  { hz: '675', a: 15 },
  { hz: '750', a: 5 },
];

const xData = spectrumData.map(item => item.hz);
const yData = spectrumData.map(item => item.a);

const equipmentData = [
  { 
    id: 29786, 
    name: "(Test_BPKMH2) Crusher 2: Single Roll Crush", 
    site: "MMP", 
    state: 5, 
    date: "2017-4-4", 
    time: "14:20:00", 
    measPoint: "24-005_CR-H05", 
    bpfo: 170, 
    f0: 4951, 
    ibeta: 2.6, 
    grade: "F", 
    whenActioned: "2024-02-01 10:53:54", 
    pointLabel: "MMP Point 3V", 
    stage: 2, 
    daysAgo: "3302 days",
    pointValue: 40 
  },
];

const GraphPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const data = equipmentData[0]; 

  const chartOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1e1e2d', 
      borderColor: 'transparent',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: function (params) {
        return `f = ${params[0].name}<br/>A = ${params[0].value}`;
      },
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: '#a855f7',
          type: 'dashed'
        },
        label: {
          backgroundColor: '#a855f7', 
          color: '#fff',
          fontWeight: 'bold',
          padding: [4, 8]
        }
      }
    },
    // ระยะห่างของกราฟกับขอบจอ
    grid: { left: '3%', right: '4%', bottom: '5%', containLabel: true },
    
    // ตั้งค่าแกน X
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: { show: false }, // ซ่อนเส้นแกน
      axisTick: { show: false }, // ซ่อนติ่งขีดๆ
      axisLabel: { 
        color: '#9ca3af',
        margin: 15
      }
    },
    
    // ตั้งค่าแกน Y
    yAxis: {
      type: 'value',
      min: 0,
      max: 150,
      interval: 30, // ขีดทีละ 30, 60, 90 ตามภาพ
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af' },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e5e7eb' // เส้น Grid แนวนอนสีเทาอ่อน
        }
      }
    },
    
    // ตั้งค่าเส้นกราฟ (Series)
    series: [
      {
        name: 'Amplitude',
        type: 'line',
        smooth: true, 
        symbolSize: 0, 
        lineStyle: {
          width: 2,
          color: '#a855f7' 
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(168, 85, 247, 0.4)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0)' }
          ])
        },
        data: yData,

        // บังคับวาดเส้นประคงที่ (Static Crosshair) ตรงจุด Peak 
        // ถ้าไม่อยากให้มันค้างไว้ (อยากให้ขึ้นแค่ตอนเอาเมาส์ชี้) ลบส่วน markLine ทิ้ง
        // markLine: {
        //   symbol: ['none', 'none'],
        //   silent: true, // ไม่ให้กดเล่นได้
        //   lineStyle: { color: '#a855f7', type: 'dashed' },
        //   label: { show: false },
        //   data: [
        //     { xAxis: '152' }, // เส้นลากลงมาหาแกน X
        //     { yAxis: 122 }    // เส้นลากไปหาแกน Y
        //   ]
        // }
      }
    ]
  };

  return (
    <div className="min-h-screen">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className={`transition-all duration-300 pt-14 md:pt-0 ${sidebarOpen ? "md:ml-64" : "md:ml-20"} relative`}>

        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 mt-4">
          
          {/* HEADER CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-[#ffe5e5] text-red-500 font-bold px-3 py-1 rounded-lg text-sm">
                [F'] Spectrum
              </span>
              <h1 className="text-xl font-bold text-[#546A81]">
                {data.name}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#A2ADB6] mb-4">
              <span>MH2</span>
              <span>{data.measPoint}</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#546A81] mb-6">
              <p>ID <span className="font-bold">17H-04</span></p>
              <p>f0 <span className="font-bold">{data.f0}</span></p>
              <p>iBeta <span className="font-bold">{data.ibeta}</span></p>
              <p>BPFO/BPFI <span className="font-bold">{data.bpfo}/180</span></p>
              <p>Point Value <span className="font-bold">{data.pointValue}</span></p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="bg-[#7f1d1d] text-white px-4 py-1.5 rounded-full font-medium tracking-wide">
                04-04-2017
              </span>
              <span className="bg-[#7f1d1d] text-white px-4 py-1.5 rounded-full font-medium tracking-wide">
                09:26:53
              </span>
            </div>
          </div>

          {/* ECHARTS GRAPH CARD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-[500px] flex flex-col">
            <div className="flex-1 w-full mt-4">
              {/* ReactECharts */}
              <ReactECharts 
                option={chartOption} 
                style={{ height: '100%', width: '100%' }} 
                opts={{ renderer: 'svg' }}
              />
            </div>
            <p className="text-center text-xs font-bold text-[#546A81] mt-2">Frequency (Hz.)</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GraphPage;