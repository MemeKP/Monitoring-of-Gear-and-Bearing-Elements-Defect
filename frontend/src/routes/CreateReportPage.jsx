import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

// Main Page
const CreateReportPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId, equipmentId } = useParams();
  const measurementData = location.state?.data;

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
    // TODO: POST /api/reports
    console.log("submit", form);
    navigate(`/dashboard/${siteId}/equipment/${equipmentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">
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

// Stepper 
const STEPS = ["Equipment Details", "Bearing Details", "Findings & Recommendations"];

const Stepper = ({ current }) => (
  <div className="flex items-start">
    {STEPS.map((label, i) => (
      <div key={i} className="flex items-start flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
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
            className={`text-xs text-center leading-tight transition-colors duration-300
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
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
  </div>
);

const Field = ({ label, name, value, onChange, placeholder, hint, type = "text", className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
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
        className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-95
                   text-white text-sm font-medium px-6 py-2.5 rounded-xl
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
        <div className="px-8 py-6 flex flex-col gap-3">
          {form.bearings.map((b, idx) => (
            <div key={b.id}
              className="border border-gray-100 rounded-xl overflow-hidden
                         transition-all duration-300 animate-fadeSlideUp">
              {/* Bearing header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50
                                   border border-blue-100 px-2.5 py-1 rounded-full">
                    Bearing {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {b.bearingNo ? `No. ${b.bearingNo}` : (
                      <span className="text-gray-400 italic">Untitled Bearing</span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => removeBearing(b.id)}
                  disabled={form.bearings.length === 1}
                  className="text-red-400 hover:text-red-600 disabled:opacity-30
                             disabled:cursor-not-allowed transition-colors duration-150 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Bearing fields */}
              <div className="grid grid-cols-4 gap-4 px-4 py-4">
                {[
                  { label: "Bearing No.", field: "bearingNo", placeholder: "e.g. 6205" },
                  { label: "Point Brg.", field: "pointBrg", placeholder: "e.g. DE" },
                  { label: "BPFO", field: "bpfo", placeholder: "e.g. 198.504", type: "number" },
                  { label: "BPFI", field: "bpfi", placeholder: "e.g. 286.496", type: "number" },
                  { label: "BSF", field: "bsf", placeholder: "e.g. 258.524", type: "number" },
                ].map(({ label, field, placeholder, type = "text" }) => (
                  <Field
                    key={field}
                    label={label}
                    name={field}
                    type={type}
                    value={b[field]}
                    onChange={(e) => updateBearing(b.id, field, e.target.value)}
                    placeholder={placeholder}
                    className={field === "bearingNo" ? "col-span-1" : ""}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Add bearing button */}
          <button
            onClick={addBearing}
            className="flex items-center justify-center gap-2 w-full py-3 mt-1
                       border-2 border-dashed border-blue-200 rounded-xl
                       text-sm font-medium text-blue-500
                       hover:bg-blue-50 hover:border-blue-400
                       active:scale-[0.99] transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Step 3: Findings & Recommendations
const FindingsStep = ({ form, measurementData, updateForm, onBack, onSubmit }) => {
  const handleChange = (e) => updateForm({ [e.target.name]: e.target.value });

  return (
    <>
      <SectionCard>
        <SectionHeader num="03" title="Findings & Recommendations" />
        <div className="px-8 py-6 flex flex-col gap-6">
          {/* Measurement context */}
          {measurementData && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-1">
              <span>ID <strong className="text-gray-800">{measurementData.id}</strong></span>
              <span>f0 <strong className="text-gray-800">{measurementData.f0}</strong></span>
              <span>iBeta <strong className="text-gray-800">{measurementData.ibeta}</strong></span>
              <span>BPFO <strong className="text-gray-800">{measurementData.bpfo}</strong></span>
              <span>Point Value <strong className="text-gray-800">
                {Number(measurementData.optPointValue || 0).toFixed(2)}
              </strong></span>
            </div>
          )}

          {/* Findings */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Findings</label>
            <textarea
              name="findings"
              value={form.findings}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what was found..."
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800
                         placeholder:text-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
                         hover:border-gray-300 transition-all duration-200"
            />
          </div>

          {/* Recommendations */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Recommendations</label>
            <textarea
              name="recommendations"
              value={form.recommendations}
              onChange={handleChange}
              rows={4}
              placeholder="Describe recommended actions..."
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800
                         placeholder:text-gray-400 resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400
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