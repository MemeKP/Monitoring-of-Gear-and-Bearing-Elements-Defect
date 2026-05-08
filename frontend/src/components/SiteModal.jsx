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
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 shadow-lg transition-all duration-300 ease-out group-hover:bg-white/15 group-hover:border-white/40 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-white font-bold text-xl mb-4">{site.name}</h2>

                {/* F */}
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <span className="text-red-500 font-bold text-3xl">F</span>
                        <span className="text-white font-bold text-3xl">{fCount}</span>
                    </div>
                    <div className="h-1 bg-white/30 rounded mt-1">
                        <div
                            className="h-1 bg-red-500 rounded"
                            style={{ width: total ? `${(fCount / total) * 100}%` : '0%' }}
                        />
                    </div>
                </div>

                {/* E */}
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-yellow-400 font-bold text-3xl">E</span>
                        <span className="text-white font-bold text-3xl">{eCount}</span>
                    </div>
                    <div className="h-1 bg-white/30 rounded mt-1">
                        <div
                            className="h-1 bg-yellow-400 rounded"
                            style={{ width: total ? `${(eCount / total) * 100}%` : '0%' }}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white/70 hover:text-white"
                    >
                        close
                    </button>
                    <button
                        onClick={() => navigate(`/dashboard/${site.id}`)}
                        className="bg-white/30 hover:bg-white/50 text-white px-4 py-2 rounded-full"
                    >
                        view →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SiteModal