import { X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useMeasurement } from "../hooks/useMeasurement"
import { useMemo } from "react"
import FrequencyChart from "./FrequencyChart"

const SidePanel = ({ equipment, onClose }) => {
  const navigate = useNavigate()
  const {siteId} = useParams()
  const { data: detailData, isLoading } = useMeasurement(equipment?.id);

  // DOWN SAMPLING (50 points)
  const miniChartData = useMemo(() => {
    const fftRaw = detailData?.envelopedFft;
    if (!fftRaw || !fftRaw.length) return [];

    const amplitudes = fftRaw.map(point => point[1]);
    
    const targetPoints = 50; 
    const step = Math.ceil(amplitudes.length / targetPoints);
    
    return amplitudes.filter((_, index) => index % step === 0);
  }, [detailData]);

  if (!equipment) return null
  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        className="fixed inset-0 bg-black/20 z-30 md:hidden"
        onClick={onClose}
      />
      <div className={`
          fixed top-0 right-0 h-full z-40 
          w-[340px] bg-white border-l border-gray-200
          flex flex-col overflow-y-auto
          transition-transform duration-300
          shadow-xl
        `}>
        <div className="p-5 flex flex-col gap-5 flex-1">
          {/* HEADER */}
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-[17px] font-bold text-[#546A81] leading-snug">
                {equipment.equipment}
              </h2>
              <p className="text-[12px] text-[#546A81] mt-1">
                {equipment.pointLabel ?? 'MMP Point 1V'}
              </p>
            </div>
            <button onClick={onClose} className="text-[#546A81] hover:text-[#242533] mt-0.5 flex-shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* STATUS */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Status</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Grade</span>
              <span className="font-medium">{equipment.grade}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">State</span>
              <span className="font-medium">{equipment.state ?? 'none'}</span>
            </div>
          </div>

          {/* LAST MEASUREMENT */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Last measurement</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Date</span>
              <span className="font-medium">{equipment.meas_date}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Days ago</span>
              <span className="font-medium">{equipment.daysAgo ?? '489 days'}</span>
            </div>
          </div>

          {/* BEARING PARAMETERS */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Bearing Parameters</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">f0</span>
              <span className="font-medium">{equipment.f0} Hz</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">iBeta</span>
              <span className="font-medium">{equipment.ibeta}</span>
            </div>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">BPFO / BPFI</span>
              <span className="font-medium">{equipment.bpfo} / {Number(equipment.bpfo) + 10}</span>
            </div>
          </div>

          {/* CHART */}
          <div className="bg-[#F9F9FC] rounded-lg p-3">
            <p className="text-[13px] font-bold text-[#546A81] mb-2">FFT Spectrum Preview</p>
            <FrequencyChart
              trendData={miniChartData} 
              isLoading={isLoading} 
            />
          </div>

          {/* VIEW */}
          <button className="mt-auto bg-[#708DA8] hover:bg-[#ffff] hover:text-[#708DA8] hover:border-solid hover:border-2 hover:border-[#708DA8] text-white font-semibold text-[14px] py-3 rounded-lg transition-colors"
            onClick={() => {navigate(`/dashboard/${siteId}/equipment/${equipment.id}`)}}
          >
            View full details
          </button>
        </div>
      </div>
    </>
  )
}

export default SidePanel