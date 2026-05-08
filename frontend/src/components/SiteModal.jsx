import { useNavigate } from "react-router-dom";

function SiteModal({ site, onClose }) {
    const fGrade = site.grades?.find(g => g.label?.startsWith('F'));
    const eGrade = site.grades?.find(g => g.label?.startsWith('E'));
    const fCount = fGrade?.count || 0;
    const eCount = eGrade?.count || 0;
    const total = fCount + eCount;
    const navigate = useNavigate()

    return (
        // backdrop
        <div
            className=" fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div className="min-w-[250px]">
                <div
                    className=" bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5  shadow-lg transition-all duration-300 ease-out group-hover:bg-white/15 group-hover:border-white/40 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-center mb-4 mt-3">
                         <h2 className="text-white  font-bold text-2xl mb-4">{site.name}</h2>
                    </div>
                   
                    {/* F */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[#ED1A3B] font-bold text-xl">F</span>
                            <span className="text-white font-bold text-xl">{fCount}</span>
                        </div>
                        <div className="h-1 bg-white/30 rounded mt-1">
                            <div
                                className="h-1 bg-[#ED1A3B] rounded"
                                style={{ width: total ? `${(fCount / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    {/* E */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <span className="text-[#FFFB00] font-bold text-xl">E</span>
                            <span className="text-white font-bold text-xl">{eCount}</span>
                        </div>
                        <div className="h-1 bg-white/30 rounded mt-1">
                            <div
                                className="h-1 bg-[#FFFB00] rounded"
                                style={{ width: total ? `${(eCount / total) * 100}%` : '0%' }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button class="Btn" onClick={() => navigate(`/dashboard/${site.id}`)}>
                            View
                            <svg viewBox="0 0 320 512" class="svg">
                                <path
                                    d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 241V96c0-17.7 14.3-32 32-32s32 14.3 32 32V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V271l-11.5 9.6-192 160z"
                                ></path>
                            </svg>
                        </button>
                    </div>
                </div></div>
        </div>
    );
}

export default SiteModal