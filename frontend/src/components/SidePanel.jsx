import { X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

// Mini frequency chart using SVG
const FrequencyChart = () => (
  <svg width="100%" height="120" viewBox="0 0 290 130" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="12" fill="#546A81" fontSize="10">306</text>
    <text x="0" y="62" fill="#546A81" fontSize="10">204</text>
    <text x="0" y="112" fill="#546A81" fontSize="10">102</text>
    <line x1="28" y1="10" x2="290" y2="10" stroke="#E5E7EB" strokeWidth="0.5" />
    <line x1="28" y1="60" x2="290" y2="60" stroke="#E5E7EB" strokeWidth="0.5" />
    <line x1="28" y1="110" x2="290" y2="110" stroke="#E5E7EB" strokeWidth="0.5" />
    <path d="M28,110 Q50,110 60,60 Q70,20 80,60 Q90,90 100,110 Q140,110 160,80 Q175,50 185,80 Q195,100 210,110 Q240,110 255,90 Q265,75 275,90 Q283,100 290,110 Z" fill="#C8D8F8" opacity="0.6" />
    <path d="M28,110 Q50,110 60,60 Q70,20 80,60 Q90,90 100,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.8" />
    <path d="M140,110 Q155,110 165,80 Q175,50 185,80 Q195,100 210,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.6" />
    <path d="M240,110 Q255,110 265,85 Q272,75 280,85 Q286,95 290,110" fill="none" stroke="#3B5BDB" strokeWidth="1.5" opacity="0.4" />
    <text x="28" y="126" fill="#546A81" fontSize="9">0</text>
    <text x="74" y="126" fill="#546A81" fontSize="9">180</text>
    <text x="126" y="126" fill="#546A81" fontSize="9">360</text>
    <text x="176" y="126" fill="#546A81" fontSize="9">540</text>
    <text x="226" y="126" fill="#546A81" fontSize="9">630</text>
    <text x="145" y="140" fill="#546A81" fontSize="9" textAnchor="middle">Frequency (Hz)</text>
  </svg>
)

const SidePanel = ({ equipment, onClose }) => {
  const navigate = useNavigate()

  const {siteId, equipmentId} = useParams()

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
              <span className="text-[#546A81]">Stage</span>
              <span className="font-medium">{equipment.stage ?? 1}</span>
            </div>
          </div>

          {/* LAST MEASUREMENT */}
          <div>
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Last measurement</p>
            <div className="flex justify-between text-[13px] py-1">
              <span className="text-[#546A81]">Date</span>
              <span className="font-medium">{equipment.date}</span>
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
              <span className="font-medium">{equipment.bpfo} / {equipment.bpfo + 10}</span>
            </div>
          </div>

          {/* CHART */}
          <div className="bg-[#F9F9FC] rounded-lg p-3">
            <p className="text-[13px] font-bold text-[#546A81] mb-2">Point Value Trend</p>
            <FrequencyChart />
          </div>

          {/* VIEW */}
          <button className="mt-auto bg-[#708DA8] hover:bg-[#ffff] hover:text-[#708DA8] hover:border-solid hover:border-2 hover:border-[#708DA8] text-white font-semibold text-[14px] py-3 rounded-lg transition-colors"
            onClick={() => {navigate(`/dashboard/${siteId}/equipment/${equipmentId}/graph`)}}
          >
            View full details
          </button>
        </div>
      </div>
    </>
  )
}

export default SidePanel