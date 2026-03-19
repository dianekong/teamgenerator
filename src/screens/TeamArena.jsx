import { useState, useRef } from 'react';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  pointerWithin, MouseSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { PersonAvatar } from '../components/PersonAvatar';
import { ConfirmModal } from '../components/ConfirmModal';
import { generateTeams, calcBalanceScore } from '../utils/generateTeams';
import { RefreshCw, Eye, EyeOff, ArrowRight } from 'lucide-react';

// ─── Draggable Person ─────────────────────────────────────────────────────────
function DraggablePerson({ person, showLabel }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: person.id,
    data: { person },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ opacity: isDragging ? 0.3 : 1, cursor: 'grab', touchAction: 'none' }}
    >
      <PersonAvatar person={person} size={44} showLabel={showLabel} />
    </div>
  );
}

// ─── Chair slot ───────────────────────────────────────────────────────────────
function ChairSlot({ id, person, teamColor, showLabel, isOver }) {
  const { setNodeRef } = useDroppable({ id, data: { slotId: id } });
  const occupied = !!person;

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 58,
        height: 58,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isOver
          ? `${teamColor}22`
          : occupied ? '#FFFFFF' : 'transparent',
        border: occupied
          ? `1.5px solid ${teamColor}88`
          : `1.5px dashed ${isOver ? teamColor : '#D4C5B5'}`,
        boxShadow: 'none',
        transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      {person && <DraggablePerson person={person} showLabel={showLabel} />}
    </div>
  );
}

const TABLE_SKILL_COLORS = {
  Senior: { dot: '#3BBF7A', bg: '#E8F8F1', text: '#3BBF7A' },
  Mid:    { dot: '#F4A423', bg: '#FEF5E7', text: '#F4A423' },
  Junior: { dot: '#F45B69', bg: '#FEE8EA', text: '#F45B69' },
};

const ROLE_CONTRIBUTIONS = {
  Senior: 'Drives architecture decisions, owns delivery, and unblocks the team on complex problems. The go-to for risk and technical direction.',
  Mid:    'Works independently on features, reviews code, and bridges communication between seniors and juniors. Keeps execution moving.',
  Junior: 'Executes well-scoped tasks, asks questions that surface blind spots, and grows rapidly with guidance. Future seniors in the making.',
};

function SkillPill({ level, count }) {
  const [show, setShow] = useState(false);
  const c = TABLE_SKILL_COLORS[level];
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 10,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.dot}88`,
          borderRadius: 999,
          padding: '1px 7px',
          cursor: 'default',
          display: 'inline-block',
        }}
      >
        {count} {level}
      </span>
      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            background: '#FFFFFF',
            border: `1.5px solid ${c.dot}`,
            borderRadius: 10,
            boxShadow: '2px 3px 0 #1A1A1A',
            padding: '8px 10px',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <p style={{ fontFamily: "'Press Start 2P'", fontSize: 7, color: c.text, marginBottom: 5 }}>
            {level}
          </p>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 10, color: '#555555', lineHeight: 1.5 }}>
            {ROLE_CONTRIBUTIONS[level]}
          </p>
        </div>
      )}
    </div>
  );
}

const INSIGHT_TONE = {
  good:    { color: '#2E9E5E', bg: '#E8F8F1' },
  warn:    { color: '#B97300', bg: '#FEF5E7' },
  neutral: { color: '#777777', bg: '#F3F3F3' },
  bad:     { color: '#D63E4E', bg: '#FEE8EA' },
};

function getSkillInsight(skills) {
  const s = skills.Senior, m = skills.Mid, j = skills.Junior;
  const total = s + m + j;
  if (total < 2) return null;

  const levels = (s > 0 ? 1 : 0) + (m > 0 ? 1 : 0) + (j > 0 ? 1 : 0);

  if (levels === 3) {
    if (j / s <= 2)
      return { text: 'Strong mentor chain — every junior has senior coverage', tone: 'good' };
    return { text: 'Full skill spread — good knowledge flow across levels', tone: 'good' };
  }

  if (levels === 2) {
    if (s > 0 && m > 0)
      return { text: 'Experienced team — seniors can guide mid-levels', tone: 'good' };
    if (m > 0 && j > 0)
      return { text: 'No senior lead — mid-levels carry the team', tone: 'warn' };
    if (s > 0 && j > 0)
      return { text: 'Skills gap — no mid-level bridge between seniors and juniors', tone: 'warn' };
  }

  if (levels === 1) {
    if (s > 0)
      return { text: 'All senior — high output but no mentoring dynamic', tone: 'neutral' };
    if (m > 0)
      return { text: 'All mid-level — steady team but no range in experience', tone: 'neutral' };
    if (j > 0)
      return { text: 'All junior — no senior or mid guidance on this team', tone: 'bad' };
  }

  return null;
}

function getDeptInsight(members) {
  const depts = members.map(m => m.department).filter(Boolean);
  if (depts.length < 2) return null;

  const counts = depts.reduce((acc, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const uniqueDepts = Object.keys(counts).length;
  const maxCount = Math.max(...Object.values(counts));
  const dominantDept = Object.entries(counts).find(([, c]) => c === maxCount)?.[0];

  if (uniqueDepts === depts.length)
    return { text: `All different departments — fully cross-functional team`, tone: 'good' };
  if (maxCount > Math.ceil(members.length / 2))
    return { text: `Heavy ${dominantDept} presence — low cross-functional diversity`, tone: 'bad' };
  if (uniqueDepts >= 3)
    return { text: `${uniqueDepts} departments represented — solid cross-functional mix`, tone: 'good' };
  if (uniqueDepts === 2)
    return { text: `Only 2 departments — limited role variety on this team`, tone: 'warn' };

  return null;
}

// ─── Round table ──────────────────────────────────────────────────────────────
function TeamTable({ team, maxSize, showLabel, overId, rejectedTeam, onRename }) {
  const [editing, setEditing] = useState(false);
  const [nameVal, setNameVal] = useState(team.teamName);
  const inputRef = useRef(null);

  const balance = calcBalanceScore(team);
  const isRejected = rejectedTeam === team.teamId;

  const membersFilled = team.members.filter(Boolean);
  const skills = { Senior: 0, Mid: 0, Junior: 0 };
  membersFilled.forEach(m => { if (m.skill) skills[m.skill]++; });
  const depts = [...new Set(membersFilled.map(m => m.department).filter(Boolean))];
  const hasMetrics = membersFilled.length >= 2 && (Object.values(skills).some(v => v > 0) || depts.length > 0);
  const insight = getSkillInsight(skills);
  const deptInsight = getDeptInsight(membersFilled);

  const tableR = maxSize <= 4 ? 78 : maxSize <= 6 ? 93 : 108;
  const containerSize = (tableR + 60) * 2;
  const cx = containerSize / 2;
  const cy = containerSize / 2;

  const slots = Array.from({ length: maxSize }, (_, i) => {
    const angle = (2 * Math.PI * i) / maxSize - Math.PI / 2;
    const x = cx + tableR * Math.cos(angle) - 29;
    const y = cy + tableR * Math.sin(angle) - 29;
    const slotId = `${team.teamId}::slot-${i}`;
    const person = team.members[i]
      ? { ...team.members[i], teamColor: team.color }
      : null;
    return { x, y, slotId, person };
  });

  const { setNodeRef: tableDropRef, isOver: tableIsOver } = useDroppable({
    id: `${team.teamId}::table`,
    data: { slotId: `${team.teamId}::table` },
  });

  function commitName() {
    onRename(team.teamId, nameVal);
    setEditing(false);
  }

  const lightColor = team.lightColor || '#F4F4F6';

  return (
    <div className="team-table-hover flex flex-col items-center">
      {/* Circle container */}
      <div style={{ position: 'relative', width: containerSize, height: containerSize }}>
        {/* Balance badge — hidden when table is empty or has only 1 member */}
        {balance !== null && (
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 z-10"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '9px',
              whiteSpace: 'nowrap',
              background: balance === 'Balanced' ? '#E8F8F1' : '#FEE8EA',
              color:      balance === 'Balanced' ? '#2E9E5E' : '#D63E4E',
              border:     `1px solid ${balance === 'Balanced' ? '#3BBF7A88' : '#F45B6988'}`,
            }}
          >
            {balance === 'Balanced' ? '⚖️ Balanced' : '⚠️ Skewed'}
          </div>
        )}

        <div style={{ position: 'absolute', inset: 0 }}>
          {/* Chair slots */}
          {slots.map(({ x, y, slotId, person }) => (
            <div key={slotId} style={{ position: 'absolute', left: x, top: y }}>
              <ChairSlot
                id={slotId}
                person={person}
                teamColor={team.color}
                showLabel={showLabel}
                isOver={overId === slotId}
              />
            </div>
          ))}

          {/* Table circle */}
          <div
            ref={tableDropRef}
            style={{
              position: 'absolute',
              left: cx - tableR * 0.55,
              top:  cy - tableR * 0.55,
              width:  tableR * 1.1,
              height: tableR * 1.1,
              borderRadius: '50%',
              background: lightColor,
              border: isRejected
                ? '3px solid #F45B69'
                : `3px solid ${tableIsOver ? team.color : '#1A1A1A'}`,
              boxShadow: isRejected
                ? `3px 3px 0 #F45B69`
                : tableIsOver
                  ? `3px 3px 0 ${team.color}`
                  : `3px 3px 0 #1A1A1A`,
              transition: 'box-shadow 0.15s, border-color 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.focus(), 10); }}
          >
            {editing ? (
              <input
                ref={inputRef}
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => { if (e.key === 'Enter') commitName(); }}
                className="text-center outline-none w-full px-2"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', background: 'transparent', color: team.color, border: 'none' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-center px-2 leading-snug"
                style={{ fontFamily: "'Press Start 2P'", fontSize: '7px', color: team.color, wordBreak: 'break-word' }}
                title="Click to rename"
              >
                {team.teamName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inline metrics */}
      {hasMetrics && (
        <div
          className="flex flex-col items-center gap-1.5 pb-3"
          style={{ maxWidth: containerSize, marginTop: 6 }}
        >
          <div className="flex flex-wrap justify-center gap-1">
            {['Senior', 'Mid', 'Junior'].filter(s => skills[s] > 0).map(s => (
              <SkillPill key={s} level={s} count={skills[s]} />
            ))}
            {depts.map(d => (
              <span
                key={d}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  background: '#F7F0E8',
                  color: '#888888',
                  border: '1px solid #D4C5B5',
                  borderRadius: 999,
                  padding: '1px 7px',
                }}
              >
                {d}
              </span>
            ))}
          </div>
          {insight && (
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                color: INSIGHT_TONE[insight.tone].color,
                background: INSIGHT_TONE[insight.tone].bg,
                borderRadius: 8,
                padding: '3px 8px',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {insight.text}
            </p>
          )}
          {deptInsight && (
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                fontSize: 10,
                color: INSIGHT_TONE[deptInsight.tone].color,
                background: INSIGHT_TONE[deptInsight.tone].bg,
                borderRadius: 8,
                padding: '3px 8px',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {deptInsight.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Bench ────────────────────────────────────────────────────────────────────
function Bench({ bench, showLabel, overId }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bench', data: { slotId: 'bench' } });
  const active = isOver || overId === 'bench';
  return (
    <div
      ref={setNodeRef}
      className="rounded-2xl p-4 mx-4 mb-6 min-h-20 flex flex-wrap gap-4 items-center"
      style={{
        background: active ? '#EAF2FD' : '#F7F0E8',
        border: `1.5px dashed ${active ? '#4A90E2' : '#D4C5B5'}`,
        transition: 'background 0.15s, border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <span style={{ fontFamily: "'Press Start 2P'", color: '#AAAAAA', fontSize: '7px' }}>
        🪑 Bench
      </span>
      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: '#CCCCCC', fontSize: '11px' }}>
        — drag people here to remove from teams
      </span>
      {bench.map(p => (
        <DraggablePerson key={p.id} person={{ ...p, teamColor: '#BBBBBB' }} showLabel={showLabel} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TeamArena({ teams, setTeams, bench, setBench, config, people, onExport }) {
  const [showLabel, setShowLabel] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [rejectedTeam, setRejectedTeam] = useState(null);
  const [rerollDropdown, setRerollDropdown] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const activePerson = (() => {
    if (!activeId) return null;
    for (const t of teams) {
      const found = t.members.find(m => m && m.id === activeId);
      if (found) return { ...found, teamColor: t.color };
    }
    return bench.find(p => p.id === activeId) || null;
  })();

  // Chair count is fixed at generation time; never grows automatically
  const getChairCount = (team) => team.chairCount ?? team.members.length;

  function findPersonLocation(personId) {
    for (let ti = 0; ti < teams.length; ti++) {
      const mi = teams[ti].members.findIndex(m => m && m.id === personId);
      if (mi !== -1) return { type: 'team', teamIndex: ti, memberIndex: mi };
    }
    const bi = bench.findIndex(p => p.id === personId);
    if (bi !== -1) return { type: 'bench', benchIndex: bi };
    return null;
  }

  function handleDragStart({ active }) { setActiveId(active.id); }
  function handleDragOver({ over }) { setOverId(over?.data?.current?.slotId || null); }

  function handleDragEnd({ active, over }) {
    setActiveId(null);
    setOverId(null);

    if (!over) return;
    const slotId = over.data.current?.slotId;
    if (!slotId) return;

    const personId = active.id;
    const src = findPersonLocation(personId);
    if (!src) return;

    const newTeams = teams.map(t => ({ ...t, members: [...t.members] }));
    const newBench = [...bench];

    let person;
    if (src.type === 'team') {
      person = newTeams[src.teamIndex].members[src.memberIndex];
      newTeams[src.teamIndex].members.splice(src.memberIndex, 1);
    } else {
      person = newBench[src.benchIndex];
      newBench.splice(src.benchIndex, 1);
    }

    if (slotId === 'bench') {
      newBench.push(person);
      setTeams(newTeams); setBench(newBench);
      return;
    }

    if (slotId.endsWith('::table')) {
      const targetTeamId = slotId.replace('::table', '');
      const targetTeamIdx = newTeams.findIndex(t => t.teamId === targetTeamId);
      if (targetTeamIdx === -1) return;
      if (newTeams[targetTeamIdx].members.length >= getChairCount(newTeams[targetTeamIdx])) {
        setRejectedTeam(targetTeamId);
        setTimeout(() => setRejectedTeam(null), 600);
        if (src.type === 'team') newTeams[src.teamIndex].members.splice(src.memberIndex, 0, person);
        else newBench.splice(src.benchIndex, 0, person);
        return;
      }
      newTeams[targetTeamIdx].members.push(person);
      setTeams(newTeams); setBench(newBench);
      return;
    }

    const parts = slotId.split('::slot-');
    if (parts.length !== 2) return;
    const targetTeamId = parts[0];
    const slotIndex = parseInt(parts[1]);
    const targetTeamIdx = newTeams.findIndex(t => t.teamId === targetTeamId);
    if (targetTeamIdx === -1) return;

    const occupant = newTeams[targetTeamIdx].members[slotIndex] ?? null;
    if (occupant) {
      newTeams[targetTeamIdx].members[slotIndex] = person;
      if (src.type === 'team') newTeams[src.teamIndex].members.splice(src.memberIndex, 0, occupant);
      else newBench.push(occupant);
    } else {
      while (newTeams[targetTeamIdx].members.length <= slotIndex)
        newTeams[targetTeamIdx].members.push(null);
      newTeams[targetTeamIdx].members[slotIndex] = person;
      while (newTeams[targetTeamIdx].members.length > 0 && newTeams[targetTeamIdx].members.at(-1) === null)
        newTeams[targetTeamIdx].members.pop();
    }

    setTeams(newTeams); setBench(newBench);
  }

  function handleRename(teamId, newName) {
    setTeams(prev => prev.map(t => t.teamId === teamId ? { ...t, teamName: newName } : t));
  }

  function handleRerollAll() {
    setConfirm({
      message: 'This will reset all your manual swaps. Continue?',
      onConfirm: () => {
        const allPeople = [
          ...teams.flatMap(t => t.members.filter(Boolean)),
          ...bench,
          ...people.filter(p => p.name.trim()
            && !teams.some(t => t.members.some(m => m && m.id === p.id))
            && !bench.some(b => b.id === p.id)),
        ];
        setTeams(generateTeams(allPeople, config));
        setBench([]);
        setConfirm(null);
      },
    });
  }

  function handleRerollTeam(teamIdx) {
    setRerollDropdown(false);
    setTeams(prev => prev.map((t, i) =>
      i === teamIdx ? { ...t, members: [...t.members].sort(() => Math.random() - 0.5) } : t
    ));
  }

  const btnBase = {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    background: '#FFFFFF',
    color: '#555555',
    border: '1.5px solid #1A1A1A',
    boxShadow: '2px 2px 0 #1A1A1A',
  };

  return (
    <div className="screen-enter flex flex-col" style={{ minHeight: '100%' }}>
      {/* Control bar */}
      <div
        className="flex items-center gap-2 px-6 py-3 flex-wrap"
        style={{
          background: '#FFFFFF',
          borderBottom: '2px solid #1A1A1A',
        }}
      >
        <button
          onClick={handleRerollAll}
          className="btn-press flex items-center gap-1.5 rounded-lg px-3 py-2"
          style={btnBase}
        >
          <RefreshCw size={12} /> Re-roll All
        </button>

        <div className="relative">
          <button
            onClick={() => setRerollDropdown(v => !v)}
            className="btn-press flex items-center gap-1.5 rounded-lg px-3 py-2"
            style={btnBase}
          >
            🔀 Re-roll Team ▾
          </button>
          {rerollDropdown && (
            <div
              className="absolute top-full left-0 mt-1 z-50 rounded-xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '1px solid #D4C5B5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
                minWidth: 160,
              }}
            >
              {teams.map((t, i) => (
                <button
                  key={t.teamId}
                  onClick={() => handleRerollTeam(i)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-2"
                  style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 12, color: '#555555' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F7F0E8'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                  {t.teamName}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowLabel(v => !v)}
          className="btn-press flex items-center gap-1.5 rounded-lg px-3 py-2"
          style={btnBase}
        >
          {showLabel ? <EyeOff size={12} /> : <Eye size={12} />}
          {showLabel ? 'Hide Names' : 'Show Names'}
        </button>

        <button
          onClick={onExport}
          className="btn-press ml-auto flex items-center gap-1.5 rounded-xl px-5 py-2 font-black"
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: 13,
            background: '#4A90E2',
            color: '#FFFFFF',
            border: '1.5px solid #1A1A1A',
            boxShadow: '2px 2px 0 #1A1A1A',
          }}
        >
          <ArrowRight size={12} /> Export
        </button>
      </div>

      {/* Arena */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 p-6">
          <div className="flex flex-wrap justify-center gap-6">
            {teams.map(team => (
              <TeamTable
                key={team.teamId}
                team={team}
                maxSize={getChairCount(team)}
                showLabel={showLabel}
                overId={overId}
                rejectedTeam={rejectedTeam}
                onRename={handleRename}
              />
            ))}
          </div>
        </div>

        <Bench bench={bench} showLabel={showLabel} overId={overId} />

        <DragOverlay dropAnimation={null}>
          {activePerson && (
            <div className="avatar-drag">
              <PersonAvatar person={activePerson} size={48} showLabel={showLabel} dragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
