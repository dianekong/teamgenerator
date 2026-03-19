import { useState } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';

const HAIR_COLORS = [
  '#2C1A0E', // near-black
  '#4A2F1A', // dark brown
  '#6B4226', // medium brown
  '#8B5E3C', // light brown
  '#C8A96E', // blonde
  '#8B3A1A', // auburn
  '#717171', // silver/gray
  '#A0724A', // warm tan
];

let nextId = 1;
const newPerson = (name = '') => ({
  id: `p-${nextId++}`,
  name,
  gender: 'male',
  skill: '',
  department: '',
  hairstyle: Math.floor(Math.random() * 4),
  hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
});

const DEPT_OPTIONS = ['', 'Frontend', 'Backend', 'QA', 'MLDC', 'Project Manager', 'DevOps'];

const SKILL_COLORS = {
  Senior: { dot: '#3BBF7A', bg: '#E8F8F1', text: '#3BBF7A' },
  Mid:    { dot: '#F4A423', bg: '#FEF5E7', text: '#F4A423' },
  Junior: { dot: '#F45B69', bg: '#FEE8EA', text: '#F45B69' },
};

const inputBase = {
  fontFamily: "'Nunito', sans-serif",
  background: '#F7F0E8',
  color: '#1A1A1A',
  border: '1px solid #D4C5B5',
  fontSize: 13,
  fontWeight: 700,
  outline: 'none',
  borderRadius: 8,
};

const SKILL_LEVELS = ['Senior', 'Mid', 'Junior'];
const DEPT_CHOICES = DEPT_OPTIONS.filter(d => d);

function PersonRow({ person, onChange, onRemove, invalid }) {
  const skill = SKILL_COLORS[person.skill];

  return (
    <div
      className="flex items-center gap-2 p-2.5 rounded-xl"
      style={{
        background: invalid ? '#FEE8EA' : '#FFFFFF',
        border: `1px solid ${invalid ? '#F45B69' : '#D4C5B5'}`,
      }}
    >
      <input
        className="flex-1 px-3 py-1.5"
        style={{
          ...inputBase,
          background: invalid ? '#FEE8EA' : '#F7F0E8',
          border: `1px solid ${invalid ? '#F45B69' : '#D4C5B5'}`,
        }}
        placeholder="Name"
        value={person.name}
        onChange={e => onChange({ ...person, name: e.target.value })}
      />

      {/* Gender toggle: only male / female */}
      <button
        onClick={() => onChange({ ...person, gender: person.gender === 'male' ? 'female' : 'male' })}
        className="btn-press rounded-lg px-2 py-1.5 font-bold"
        style={{
          fontFamily: "'Nunito', sans-serif",
          background: person.gender === 'female' ? '#F5EEF8' : '#EAF2FD',
          color: person.gender === 'female' ? '#9B59B6' : '#4A90E2',
          border: '1.5px solid #1A1A1A',
          boxShadow: '2px 2px 0 #1A1A1A',
          minWidth: 54,
          fontSize: 11,
        }}
        title="Toggle gender"
      >
        {person.gender === 'female' ? '👩 F' : '👨 M'}
      </button>

      {/* Skill dropdown */}
      <select
        className="rounded-lg px-2 py-1.5 appearance-none"
        style={{
          ...inputBase,
          background: skill ? skill.bg : '#F7F0E8',
          color: skill ? skill.text : '#888888',
          border: `1px solid ${skill ? skill.dot + '88' : '#D4C5B5'}`,
          fontSize: 12,
          minWidth: 88,
        }}
        value={person.skill}
        onChange={e => onChange({ ...person, skill: e.target.value })}
      >
        <option value="">— Skill</option>
        <option value="Junior">Junior</option>
        <option value="Mid">Mid</option>
        <option value="Senior">Senior</option>
      </select>

      {/* Department dropdown */}
      <select
        className="rounded-lg px-2 py-1.5 appearance-none"
        style={{
          ...inputBase,
          background: person.department ? '#F7F0E8' : '#F7F0E8',
          color: person.department ? '#1A1A1A' : '#888888',
          fontSize: 12,
          minWidth: 140,
        }}
        value={person.department}
        onChange={e => onChange({ ...person, department: e.target.value })}
      >
        {DEPT_OPTIONS.map(d => (
          <option key={d} value={d}>{d || '— Dept'}</option>
        ))}
      </select>

      <button
        onClick={onRemove}
        className="btn-press rounded-lg p-1.5"
        style={{
          color: '#CCCCCC',
          background: '#F0EDE8',
          border: '1.5px solid #1A1A1A',
          boxShadow: '2px 2px 0 #1A1A1A',
          lineHeight: 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#F45B69'; e.currentTarget.style.borderColor = '#F45B69'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#CCCCCC'; e.currentTarget.style.borderColor = '#1A1A1A'; }}
        title="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export function RosterSetup({ people, setPeople, config, setConfig, onGenerate }) {
  const [bulkText, setBulkText] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [numTeamsVal, setNumTeamsVal] = useState(config.mode === 'byCount' ? config.value : 4);
  const [perTeamVal, setPerTeamVal] = useState(config.mode === 'bySize' ? config.value : 5);

  const validCount = people.filter(p => p.name.trim()).length;
  const canGenerate = validCount >= 2;

  function addPerson() {
    setPeople(prev => [...prev, newPerson()]);
  }

  function addBulk() {
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean);
    if (!names.length) return;
    setPeople(prev => [...prev, ...names.map(n => newPerson(n))]);
    setBulkText('');
  }

  function updatePerson(id, updated) {
    setPeople(prev => prev.map(p => p.id === id ? updated : p));
  }

  function removePerson(id) {
    setPeople(prev => prev.filter(p => p.id !== id));
  }

  function randomFillAll() {
    setPeople(prev => prev.map(p => ({
      ...p,
      skill: SKILL_LEVELS[Math.floor(Math.random() * SKILL_LEVELS.length)],
      department: DEPT_CHOICES[Math.floor(Math.random() * DEPT_CHOICES.length)],
    })));
  }

  function handleGenerate() {
    if (!canGenerate) { setShowErrors(true); return; }
    setSpinning(true);
    setTimeout(() => { setSpinning(false); onGenerate(); }, 850);
  }

  const sizeValidation = (() => {
    if (config.mode === 'bySize' && config.value >= validCount && validCount >= 2)
      return 'Not enough people for that team size';
    if (config.mode === 'byCount' && config.value < 2)
      return 'Need at least 2 teams';
    return null;
  })();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 screen-enter">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 style={{ fontFamily: "'Press Start 2P'", fontSize: '15px', color: '#F45B69', marginBottom: 12 }}>
          Who&apos;s Playing?
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: '#888888', fontSize: '15px' }}>
          Add your team members below. Skill level and department are optional but help balance teams.
        </p>
      </div>

      {/* Bulk add */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #D4C5B5',
        }}
      >
        <textarea
          className="w-full p-3 resize-none rounded-xl"
          style={{
            ...inputBase,
            minHeight: 72,
            fontWeight: 700,
          }}
          placeholder="Paste names here, one per line, then click Add All"
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
        />
        <button
          onClick={addBulk}
          disabled={!bulkText.trim()}
          className="btn-press mt-3 rounded-xl px-4 py-2 font-bold disabled:opacity-40"
          style={{
            fontFamily: "'Nunito', sans-serif",
            background: '#FEE8EA',
            color: '#F45B69',
            border: '1.5px solid #1A1A1A',
            boxShadow: '2px 2px 0 #1A1A1A',
            fontSize: 13,
          }}
        >
          ＋ Add All
        </button>
      </div>

      {/* Person rows */}
      <div className="flex flex-col gap-2.5 mb-4">
        {people.length === 0 && (
          <div
            className="text-center py-12 rounded-2xl"
            style={{
              color: '#AAAAAA',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '14px',
              background: '#FFFFFF',
              border: '1.5px dashed #D4C5B5',
            }}
          >
            <div className="mb-3" style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="96" height="72" viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Left character */}
                {/* Head */}
                <rect x="8" y="4" width="22" height="22" rx="4" fill="#FEE8EA" stroke="#1A1A1A" strokeWidth="2.5"/>
                {/* Eyes */}
                <rect x="13" y="11" width="4" height="4" rx="1" fill="#1A1A1A"/>
                <rect x="21" y="11" width="4" height="4" rx="1" fill="#1A1A1A"/>
                {/* Smile */}
                <path d="M14 20 Q19 24 24 20" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" fill="none"/>
                {/* Body */}
                <rect x="6" y="30" width="26" height="20" rx="4" fill="#F45B69" stroke="#1A1A1A" strokeWidth="2.5"/>
                {/* Arms */}
                <rect x="0" y="31" width="8" height="12" rx="3" fill="#FEE8EA" stroke="#1A1A1A" strokeWidth="2"/>
                <rect x="30" y="31" width="8" height="12" rx="3" fill="#FEE8EA" stroke="#1A1A1A" strokeWidth="2"/>
                {/* Legs */}
                <rect x="9" y="48" width="8" height="14" rx="3" fill="#FEE8EA" stroke="#1A1A1A" strokeWidth="2"/>
                <rect x="21" y="48" width="8" height="14" rx="3" fill="#FEE8EA" stroke="#1A1A1A" strokeWidth="2"/>

                {/* "+" in the middle */}
                <text x="48" y="38" textAnchor="middle" fontFamily="'Press Start 2P'" fontSize="14" fill="#D4C5B5" fontWeight="bold">+</text>

                {/* Right character — dashed/ghost style */}
                {/* Head */}
                <rect x="66" y="4" width="22" height="22" rx="4" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2.5" strokeDasharray="4 2"/>
                {/* Eyes (dots) */}
                <rect x="71" y="11" width="4" height="4" rx="1" fill="#D4C5B5"/>
                <rect x="79" y="11" width="4" height="4" rx="1" fill="#D4C5B5"/>
                {/* Mouth flat */}
                <rect x="74" y="20" width="8" height="2" rx="1" fill="#D4C5B5"/>
                {/* Body */}
                <rect x="64" y="30" width="26" height="20" rx="4" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2.5" strokeDasharray="4 2"/>
                {/* Arms */}
                <rect x="58" y="31" width="8" height="12" rx="3" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2" strokeDasharray="3 2"/>
                <rect x="88" y="31" width="8" height="12" rx="3" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2" strokeDasharray="3 2"/>
                {/* Legs */}
                <rect x="67" y="48" width="8" height="14" rx="3" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2" strokeDasharray="3 2"/>
                <rect x="79" y="48" width="8" height="14" rx="3" fill="#F7F0E8" stroke="#D4C5B5" strokeWidth="2" strokeDasharray="3 2"/>
              </svg>
            </div>
            Add at least 2 people to get started!
          </div>
        )}
        {people.map(p => (
          <PersonRow
            key={p.id}
            person={p}
            invalid={showErrors && !p.name.trim()}
            onChange={updated => updatePerson(p.id, updated)}
            onRemove={() => removePerson(p.id)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-8">
      <button
        onClick={addPerson}
        className="btn-press flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold"
        style={{
          fontFamily: "'Nunito', sans-serif",
          background: '#FFFFFF',
          color: '#888888',
          border: '1.5px dashed #D4C5B5',
          fontSize: 13,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#F45B69'; e.currentTarget.style.borderColor = '#F45B69'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#888888'; e.currentTarget.style.borderColor = '#1A1A1A'; }}
      >
        <UserPlus size={14} /> ＋ Add Person
      </button>

      {people.length > 0 && (
        <button
          onClick={randomFillAll}
          className="btn-press flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold"
          style={{
            fontFamily: "'Nunito', sans-serif",
            background: '#FEF5E7',
            color: '#F4A423',
            border: '1.5px solid #1A1A1A',
            boxShadow: '2px 2px 0 #1A1A1A',
            fontSize: 13,
          }}
          title="Randomly fill skill & department for everyone"
        >
          🎲 Random Fill All
        </button>
      )}
      </div>

      {/* Team config */}
      <div
        className="rounded-2xl p-6 mb-8"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #D4C5B5',
        }}
      >
        <h3 style={{ fontFamily: "'Press Start 2P'", fontSize: '9px', color: '#1A1A1A', marginBottom: 20 }}>
          Team Setup
        </h3>

        {/* Dual team config inputs */}
        <div className="flex gap-3 mb-5">
          {[
            { key: 'byCount', label: '# of Teams', val: numTeamsVal, min: 2, max: 10,
              onChange: e => {
                const n = Math.max(2, Math.min(10, parseInt(e.target.value) || 2));
                setNumTeamsVal(n);
                setConfig(c => ({ ...c, mode: 'byCount', value: n }));
              }},
            { key: 'bySize', label: 'Per Team', val: perTeamVal, min: 2, max: 20,
              onChange: e => {
                const n = Math.max(2, Math.min(20, parseInt(e.target.value) || 2));
                setPerTeamVal(n);
                setConfig(c => ({ ...c, mode: 'bySize', value: n }));
              }},
          ].map(({ key, label, val, min, max, onChange: handleChange }) => {
            const active = config.mode === key;
            return (
              <div
                key={key}
                className="flex-1 rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer"
                style={{
                  background: active ? '#FEE8EA' : '#F7F0E8',
                  border: `1.5px solid ${active ? '#F45B69' : '#D4C5B5'}`,
                  boxShadow: active ? '2px 2px 0 #1A1A1A' : 'none',
                  transition: 'all 0.15s',
                }}
                onClick={() => {
                  if (!active) {
                    if (key === 'byCount') setConfig(c => ({ ...c, mode: 'byCount', value: numTeamsVal }));
                    else setConfig(c => ({ ...c, mode: 'bySize', value: perTeamVal }));
                  }
                }}
              >
                <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: active ? '#D63E4E' : '#888888', fontSize: 11 }}>
                  {label}
                </span>
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={val}
                  onChange={handleChange}
                  onClick={e => e.stopPropagation()}
                  className="rounded-lg px-2 py-1 text-center font-black w-16"
                  style={{ ...inputBase, fontSize: 22, background: 'transparent', border: 'none', color: active ? '#1A1A1A' : '#AAAAAA', outline: 'none' }}
                />
              </div>
            );
          })}
        </div>

        {sizeValidation && (
          <p
            className="mb-4 text-xs rounded-xl px-3 py-2 font-bold"
            style={{
              fontFamily: "'Nunito', sans-serif",
              color: '#D63E4E',
              background: '#FEE8EA',
              border: '1px solid #F45B6988',
            }}
          >
            ⚠ {sizeValidation}
          </p>
        )}

        {/* Balance priority */}
        <div>
          <label style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: '#888888', fontSize: '13px', display: 'block', marginBottom: 10 }}>
            Balance priority
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'skill', label: 'Skill level first' },
              { val: 'dept',  label: 'Department first' },
              { val: 'both',  label: 'Equal mix (default)' },
              { val: 'random',label: 'Fully random' },
            ].map(({ val, label }) => (
              <label
                key={val}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer"
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '13px',
                  color: config.priority === val ? '#1A1A1A' : '#555555',
                  background: config.priority === val ? '#FEE8EA' : '#F7F0E8',
                  border: `1px solid ${config.priority === val ? '#F45B69' : '#D4C5B5'}`,
                }}
              >
                <input
                  type="radio"
                  name="priority"
                  value={val}
                  checked={config.priority === val}
                  onChange={() => setConfig(c => ({ ...c, priority: val }))}
                  style={{ accentColor: '#F45B69' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={!canGenerate || !!sizeValidation}
          className="btn-brand-press rounded-2xl px-10 py-4 font-black disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Press Start 2P'",
            fontSize: '10px',
            background: canGenerate && !sizeValidation ? '#F45B69' : '#D4C5B5',
            color: canGenerate && !sizeValidation ? '#FFFFFF' : '#888888',
            border: '2px solid #1A1A1A',
            boxShadow: canGenerate && !sizeValidation ? '3px 3px 0 #1A1A1A' : '2px 2px 0 #AAAAAA',
            letterSpacing: '0.5px',
          }}
          title={!canGenerate ? 'Add at least 2 people to generate teams' : undefined}
        >
          <span
            style={{ display: 'inline-block', animation: spinning ? 'spin-once 0.8s ease-in-out' : 'none' }}
          >
            🎲
          </span>{' '}
          Randomize Teams!
        </button>
        {!canGenerate && (
          <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: '#AAAAAA', fontSize: '13px', marginTop: 10 }}>
            Add at least 2 people to get started
          </p>
        )}
      </div>
    </div>
  );
}
