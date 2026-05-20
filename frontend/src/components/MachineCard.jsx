import { ChevronRight, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import { GRADE_BADGE_COLORS } from '../constant/gradeConfig';
import { useNavigate, useParams } from 'react-router-dom';

const GRADE_ORDER = ["F", "E", "D", "C", "B", "A"];

function uniqueGrades(states) {
  return [...new Set(states.map((s) => s.state))].sort(
    (a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b)
  );
}

const GradeBadge = ({ grade }) => {
  const colors = GRADE_BADGE_COLORS[grade] || { bg: '#eee', text: '#333' };
  return (
    <span
      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: colors.bg, color: colors.text }}
    >
      {grade}
    </span>
  );
};

const IdRows = ({ ids }) => {
  const navigate = useNavigate()
  const { siteId } = useParams()

  if (!ids || ids.length === 0) return null;

  return (
    <div className="mt-1 mx-1 hover:cursor-pointer rounded-lg border border-[#EEEEF2] overflow-hidden">
      {ids.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-center gap-2 px-3 py-2 ${i < ids.length - 1 ? 'border-b border-[#EEEEF2]' : ''
            }`}
          onClick={() => { navigate(`/dashboard/${siteId}/equipment/${item.id}`) }}
        >
          <span className="font-mono text-[12px] text-[#484964] min-w-[80px]">
            {item.id}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#0C447C]">
            BPFO={item.bpfo}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEEDFE] text-[#3C3489]">
            BPFI={item.bpfi}
          </span>
        </div>
      ))}
    </div>
  );
};

const StateRow = ({ state }) => {
  const [open, setOpen] = useState(false);
  const hasIds = state.ids && state.ids.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${hasIds ? 'cursor-pointer' : 'cursor-default'
          } ${open ? 'bg-white border border-[#EEEEF2]' : 'hover:bg-white border border-transparent'}`}
        onClick={() => hasIds && setOpen((v) => !v)}
      >
        <ChevronRight
          size={13}
          className={`text-[#546A81] shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''
            } ${!hasIds ? 'invisible' : ''}`}
        />
        <GradeBadge grade={state.state} />
        <span className="text-[13px] text-[#484964] font-medium flex-1">
          State {state.state}
        </span>
        {hasIds && (
          <span className="text-[11px] text-[#546A81]">
            {state.ids.length} point{state.ids.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {open && <IdRows ids={state.ids} />}
    </div>
  );
};

function DateRow({ entry }) {
  const [open, setOpen] = useState(false);
  const activeStates = entry.states.filter((s) => s.ids && s.ids.length > 0);
  const grades = uniqueGrades(activeStates);

  return (
    <div className="rounded-xl border border-[#EEEEF2] overflow-hidden bg-[#F9F9FC]">
      <div
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${open ? 'bg-[#F3F6FB]' : 'hover:bg-[#F3F6FB]'
          }`}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronRight
          size={13}
          className={`text-[#546A81] shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
        />
        <Calendar size={13} className="text-[#546A81] shrink-0" />
        <span className="text-[13px] text-[#546A81] flex-1">{entry.date}</span>
        <div className="flex gap-1">
          {grades.map((g) => (
            <GradeBadge key={g} grade={g} />
          ))}
        </div>
      </div>

      {open && (
        <div className="px-3 pb-2 pt-1 flex flex-col gap-1 border-t border-[#EEEEF2] bg-[#F9F9FC]">
          {activeStates.map((s, i) => (
            <StateRow key={i} state={s} />
          ))}
        </div>
      )}
    </div>
  );
}

const MachineCard = ({ item }) => {
  const [open, setOpen] = useState(false);
  if (!item) return null;
  const colors = GRADE_BADGE_COLORS[item.grade] || { bg: '#ffe5e5', text: '#ef4444' };

  return (
    <div
      className={`bg-white ml-6 mr-4 rounded-2xl border transition-colors duration-150 ${open ? 'border-[#C8D6E5]' : 'border-[#EEEEF2] hover:border-[#C8D6E5]'
        }`}
    >
      {/* Machine header */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer rounded-2xl transition-colors ${open ? 'bg-[#F3F6FB] rounded-b-none' : 'hover:bg-[#F3F6FB]'
          }`}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          />
          <span className="font-medium">{item.name}</span>
        </div>

        <span
          className="px-2.5 py-0.5 inline-flex items-center justify-center rounded-full font-semibold shrink-0"
          style={{ background: colors.bg, color: colors.text }}
        >
          {item.grade}
        </span>
      </div>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-2 border-t border-[#EEEEF2]">
          {item.dates?.map((d, i) => (
            <DateRow key={i} entry={d} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MachineCard;