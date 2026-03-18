const STEPS = ['Roster Setup', 'Team Arena', 'Export'];

export function TopBar({ screen, onStartOver }) {
  const idx = screen === 'roster' ? 0 : screen === 'arena' ? 1 : 2;

  return (
    <div
      className="flex items-center justify-between px-6 py-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '2px solid #1A1A1A',
      }}
    >
      <h1 style={{ fontFamily: "'Press Start 2P'", fontSize: '10px', color: '#F45B69', letterSpacing: '0.5px' }}>
        🎲 Team Randomizer
      </h1>

      <div className="flex items-center gap-1.5">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-1.5">
            <span
              className="rounded-lg px-3 py-1.5"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '12px',
                fontWeight: i === idx ? 800 : 700,
                color: i === idx ? '#FFFFFF' : '#AAAAAA',
                background: i === idx ? '#F45B69' : 'transparent',
                border: i === idx ? '1.5px solid #1A1A1A' : '1.5px solid transparent',
                boxShadow: i === idx ? '2px 2px 0 #1A1A1A' : 'none',
              }}
            >
              {i + 1}. {step}
            </span>
            {i < STEPS.length - 1 && (
              <span style={{ color: '#CCCCCC', fontSize: '14px', fontWeight: 700 }}>›</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onStartOver}
        className="btn-press rounded-lg px-3 py-1.5 font-bold"
        style={{
          fontFamily: "'Nunito', sans-serif",
          background: '#FEE8EA',
          color: '#F45B69',
          border: '2px solid #1A1A1A',
          boxShadow: '2px 2px 0 #1A1A1A',
          fontSize: 12,
        }}
      >
        ↺ Start Over
      </button>
    </div>
  );
}
