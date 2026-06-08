import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
const CreateReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId, equipmentId } = useParams();
  const measurementData = location.state?.data;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1
    kks: measurementData?.kks ?? "",
    equipmentName: measurementData?.equipment ?? "",
    rpm: "",
    // Step 2
    bearings: [{ id: 1, bearingNo: "", pointBrg: "", bpfo: "", bpfi: "", bsf: "" }],
    // Step 3
    findings: "",
    recommendations: "",
  });

  const updateForm = (fields) => setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = async () => {
    if (!measurementData?.id) {
      alert("Error: not found this graph's ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        envelopedFftId: measurementData.id, 
        kks: form.kks,
        equipmentName: form.equipmentName,
        rpm: form.rpm ? Number(form.rpm) : null, 
        bearings: form.bearings, 
        findings: form.findings,
        recommendations: form.recommendations,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // for authen
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 409) {
           throw new Error("Already have report!");
        }
        throw new Error("Cannot save the data.");
      }

      const result = await response.json();
      console.log("Saved Report!", result);

      navigate(`/dashboard/${siteId}/equipment/${equipmentId}`);

    } catch (error) {
      console.error("Error saving report:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <h1 className="text-center text-2xl font-semibold text-[#1e3a5f] mb-8">
          Create New Report
        </h1>
        <Stepper current={step - 1} />

        <div className="mt-8">
          {step === 1 && (
            <EquipmentDetailsStep
              form={form}
              updateForm={updateForm}
              onNext={() => setStep(2)}
              onCancel={() => navigate(-1)}
            />
          )}
          {step === 2 && (
            <BearingDetailsStep
              form={form}
              updateForm={updateForm}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <FindingsStep
              form={form}
              measurementData={measurementData}
              updateForm={updateForm}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const STEPS = ["Equipment Details", "Bearing Details", "Findings & Recommendations"];

const Stepper = ({ current }) => (
  <div className="flex items-start w-full max-w-2xl mx-auto mb-8">
    {STEPS.map((label, i) => (
      <div key={i} className="flex items-start flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1.5 w-36 shrink-0">
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300
              ${i < current
                ? "bg-blue-600 border-blue-600"
                : i === current
                  ? "bg-white border-blue-600 ring-4 ring-blue-100"
                  : "bg-white border-gray-300"
              }`}
          />
          <span
            className={`text-xs text-center leading-tight transition-colors duration-300 px-1
              ${i === current
                ? "text-blue-600 font-medium"
                : i < current
                  ? "text-blue-400"
                  : "text-gray-400"
              }`}
          >
            {label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className="flex-1 h-0.5 mt-2.5 mx-1 rounded-full overflow-hidden bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: i < current ? "100%" : "0%" }}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);
// Shared components 
const SectionCard = ({ children, animate = true }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden
                ${animate ? "animate-fadeSlideUp" : ""}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ num, title }) => (
  <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100">
    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                    text-sm font-medium text-gray-500 shrink-0">
      {num}
    </div>
    <h2 className="text-lg font-semibold text-[#546A81]">{title}</h2>
  </div>
);

const Field = ({ label, name, value, onChange, placeholder, hint, type = "text", className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-semibold text-[#546A81]">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-800
                 placeholder:text-gray-400 bg-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                 hover:border-gray-300 transition-all duration-200"
    />
    {hint && <p className="text-xs text-blue-400">{hint}</p>}
  </div>
);

const FooterActions = ({ onBack, onNext, onSubmit, nextLabel = "Next", backLabel = "Back" }) => (
  <div className="flex justify-between mt-6">
    {onBack ? (
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-500
                   border border-gray-200 px-5 py-2.5 rounded-xl
                   hover:bg-gray-50 active:scale-95 transition-all duration-150"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {backLabel}
      </button>
    ) : <div />}

    {(onNext || onSubmit) && (
      <button
        onClick={onNext ?? onSubmit}
        className="flex items-center gap-2 bg-[#D5E9FF] hover:bg-[#BADBFF] active:scale-95
                   text-[#0077FF] text-sm font-medium px-6 py-2.5 rounded-xl
                   transition-all duration-150 shadow-sm"
      >
        {nextLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={onSubmit ? "M5 13l4 4L19 7" : "M9 5l7 7-7 7"} />
        </svg>
      </button>
    )}
  </div>
);

// Step 1: Equipment Details 
const EquipmentDetailsStep = ({ form, updateForm, onNext, onCancel }) => {
  const handleChange = (e) =>
    updateForm({ [e.target.name]: e.target.value });

  return (
    <>
      <SectionCard>
        <SectionHeader num="01" title="Equipment Details" />
        <div className="px-8 py-7">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <Field label="KKS" name="kks" value={form.kks}
              onChange={handleChange} placeholder="e.g. no" />
            <Field label="Equipment name" name="equipmentName" value={form.equipmentName}
              onChange={handleChange} placeholder="e.g. A-LP"
              hint="Full name of the equipment" />
            <Field label="RPM" name="rpm" type="number" value={form.rpm}
              onChange={handleChange} placeholder="e.g. 2950"
              hint="Rotational speed in revolutions per minute" />
          </div>
        </div>
      </SectionCard>
      <FooterActions onNext={onNext} />
    </>
  );
};

// Step 2: Bearing Details
let nextBearingId = 2;

const BearingDetailsStep = ({ form, updateForm, onBack, onNext }) => {
  const setBearings = (bearings) => updateForm({ bearings });

  const addBearing = () => {
    setBearings([
      ...form.bearings,
      { id: nextBearingId++, bearingNo: "", pointBrg: "", bpfo: "", bpfi: "", bsf: "" },
    ]);
  };

  const removeBearing = (id) => {
    if (form.bearings.length === 1) return;
    setBearings(form.bearings.filter((b) => b.id !== id));
  };

  const updateBearing = (id, field, value) => {
    setBearings(form.bearings.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <>
      <SectionCard>
        <SectionHeader num="02" title="Bearing Details" />
        <div className="px-4 sm:px-8 py-6 flex flex-col gap-4">
          {form.bearings.map((b, idx) => (
            <div key={b.id}
              className="border border-gray-100 rounded-xl overflow-hidden
                         transition-all duration-300 animate-fadeSlideUp">
              {/* Bearing header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50
                                   border border-blue-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                    Bearing {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">
                    {b.bearingNo ? `No. ${b.bearingNo}` : (
                      <span className="text-gray-400 italic">Untitled Bearing</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => removeBearing(b.id)}
                  disabled={form.bearings.length === 1}
                  className="text-red-400 hover:text-red-600 disabled:opacity-30
                             disabled:cursor-not-allowed transition-colors duration-150 p-1 shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 px-4 py-4">
                {[
                  { label: "Bearing No.", field: "bearingNo", placeholder: "e.g. 6205", span: "sm:col-span-1 md:col-span-3" },
                  { label: "Point Brg.", field: "pointBrg", placeholder: "e.g. DE", span: "sm:col-span-1 md:col-span-3" },
                  { label: "BPFO", field: "bpfo", placeholder: "e.g. 198.504", type: "number", span: "sm:col-span-1 md:col-span-2" },
                  { label: "BPFI", field: "bpfi", placeholder: "e.g. 286.496", type: "number", span: "sm:col-span-1 md:col-span-2" },
                  { label: "BSF", field: "bsf", placeholder: "e.g. 258.524", type: "number", span: "sm:col-span-2 md:col-span-2" },
                ].map(({ label, field, placeholder, type = "text", span }) => (
                  <Field
                    key={field}
                    label={label}
                    name={field}
                    type={type}
                    value={b[field]}
                    onChange={(e) => updateBearing(b.id, field, e.target.value)}
                    placeholder={placeholder}
                    className={span} 
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Add bearing button */}
          <button
            onClick={addBearing}
            className="flex items-center justify-center gap-2 w-full py-3 sm:py-4 mt-1
                       border-2 border-dashed border-blue-200 rounded-xl
                       text-sm font-medium text-blue-500
                       hover:bg-blue-50 hover:border-blue-400
                       active:scale-[0.99] transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Bearing
          </button>
        </div>
      </SectionCard>
      <FooterActions onBack={onBack} onNext={onNext} />
    </>
  );
};

const FindingsStep = ({ 
  form, 
  measurementData, 
  updateForm, 
  onBack, 
  onSubmit, 
   
}) => {
  const envelopedFftData = measurementData?.envelopedFft || [];
  const peaksData = measurementData?.peakData || [];
  const detailPeakData = measurementData?.detailPeak || [];

  const maxHz = envelopedFftData.length > 0
    ? Math.max(...envelopedFftData.map(p => p[0] || 0))
    : 1000;

  const peakPoints = peaksData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return { coord: [point[0], point[1]], value: point[1] };
  }).filter(Boolean);

  const harmonicPoints = detailPeakData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return { coord: [point[0], point[1]], value: point[1] };
  }).filter(Boolean);

  const peakLines = peaksData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return {
      xAxis: point[0],
      lineStyle: { color: '#ef4444', type: 'solid', width: 1, opacity: 0.8 },
      label: { show: true, position: 'end', formatter: `f: ${point[0].toFixed(2)} Hz\nA: ${point[1].toFixed(2)}`, color: '#ffffff', backgroundColor: '#ef4444', padding: [4, 8], borderRadius: 4, fontSize: 10, lineHeight: 14, align: 'center' }
    }
  }).filter(Boolean);

  const harmonicLines = detailPeakData.map(index => {
    const point = envelopedFftData[index];
    if (!point) return null;
    return {
      xAxis: point[0],
      lineStyle: { color: '#c084fc', type: 'dashed', opacity: 0.6 },
      label: { show: false }
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
  const handleChange = (e) => updateForm({ [e.target.name]: e.target.value });

  return (
    <>
      <SectionCard>
        <SectionHeader num="03" title="Findings & Recommendations" />
        <div className="px-4 sm:px-8 py-6 flex flex-col gap-8">
          
          <div className="bg-[#F8F9FA] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-xl font-semibold text-[#546A81]">
                {measurementData?.equipment}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span>{measurementData?.site || 'NaN'}</span>
                <span>{measurementData?.measPoint || 'NaN'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <span>ID <strong className="text-[#546A81] font-semibold">{measurementData?.id || '135548'}</strong></span>
              <span>f0 <strong className="text-[#546A81] font-semibold">{measurementData?.f0 || '2528'}</strong></span>
              <span>iBeta <strong className="text-[#546A81] font-semibold">{measurementData?.ibeta || '3.0'}</strong></span>
              <span>BPFO/BPFI <strong className="text-[#546A81] font-semibold">
                {measurementData?.bpfo || 'NaN'}/{Number(measurementData.bpfo) + 10}
              </strong></span>
              <span>Point Value <strong className="text-[#546A81] font-semibold">
                {measurementData?.optPointValue ? Number(measurementData.optPointValue).toFixed(2) : '44.96'}
              </strong></span>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <span className="bg-[#D5E9FF] text-[#0077FF] px-3.5 py-1 rounded-full text-xs font-medium">
                {measurementData?.measDate || '2022-11-14'}
              </span>
              <span className="bg-[#D5E9FF] text-[#0077FF] px-3.5 py-1 rounded-full text-xs font-medium">
                {measurementData?.measTime || '14:15:00'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 h-[400px] sm:h-[500px] flex flex-col relative">
            <div className="absolute top-4 right-4 sm:right-6 flex items-center gap-4 text-xs sm:text-sm z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#a855f7]"></span>
                <span className="text-gray-600">Vibration Amplitude</span>
              </div>
            </div>

            <div className="flex-1 w-full mt-6">
              {chartOption ? (
                <ReactECharts
                  option={chartOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                  notMerge={true}
                
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-xl">
                  <p className="text-gray-400 text-sm">No chart data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Findings */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#546A81]">Findings</label>
            <textarea
              name="findings"
              value={form.findings}
              onChange={handleChange}
              rows={4}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#546A81]
                         placeholder:text-gray-400 resize-none shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                         hover:border-gray-300 transition-all duration-200"
            />
          </div>

          {/* Recommendations */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#546A81]">Recommendations</label>
            <textarea
              name="recommendations"
              value={form.recommendations}
              onChange={handleChange}
              rows={4}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#546A81]
                         placeholder:text-gray-400 resize-none shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                         hover:border-gray-300 transition-all duration-200"
            />
          </div>
          
        </div>
      </SectionCard>
      <FooterActions onBack={onBack} onSubmit={onSubmit} nextLabel="Save Report" />
    </>
  );
};

export default CreateReportPage;

