const SKILL_COLORS = { Senior: '#3BBF7A', Mid: '#F4A423', Junior: '#F45B69' };

const HEAD_FILL   = '#FDDBB4';
const HEAD_STROKE = '#E8C49A';
const EYE_FILL    = '#444444';
const MOUTH       = '#C08060';
const LEGS_MALE   = '#78909C';
const LEGS_FEMALE = '#7986CB';
const SHOE        = '#4E342E';

// ─── Male hair ─────────────────────────────────────────────────────────────────
// Styles: 0 = buzz, 1 = spiky, 2 = side-part, 3 = curly
// Back layer: rendered BEHIND the head (for sides/depth)
function MaleHairBack({ style, color }) {
  if (style === 3) {
    // Curly: small puffs behind the head on each side for width
    return (
      <>
        <circle cx="11" cy="9" r="4.5" fill={color} />
        <circle cx="29" cy="9" r="4.5" fill={color} />
      </>
    );
  }
  return null;
}

// Front layer: rendered ON TOP of the head circle (scalp area, y ≤ 11)
function MaleHairFront({ style, color }) {
  switch (style) {
    case 1: // spiky — visible triangular spikes over the crown
      return (
        <>
          {/* Base strip on scalp */}
          <path d="M12 9 Q12 4.5 20 4.5 Q28 4.5 28 9 Z" fill={color} />
          {/* Spikes */}
          <polygon points="13,8 15.5,1 18,8"   fill={color} />
          <polygon points="18,7 20.5,0 23,7"   fill={color} />
          <polygon points="22,8 24.5,1 27,8"   fill={color} />
        </>
      );
    case 2: // side-part — swept asymmetrically to the right
      return (
        <path
          d="M12 10 Q12 3 17 2.5 Q22 2 28 5.5 Q29 8 29 10 Q25 7 20 6 Q15 6.5 12 10 Z"
          fill={color}
        />
      );
    case 3: // curly — overlapping puffs across the crown
      return (
        <>
          <circle cx="13.5" cy="8"   r="4.5" fill={color} />
          <circle cx="19.5" cy="5"   r="4.5" fill={color} />
          <circle cx="25.5" cy="6.5" r="4.5" fill={color} />
          <circle cx="20"   cy="8.5" r="4"   fill={color} />
        </>
      );
    default: // 0: buzz/short — tight cap following the head curve
      return (
        <path
          d="M11 10 Q11 2 20 2 Q29 2 29 10 Q26 7 20 7 Q14 7 11 10 Z"
          fill={color}
        />
      );
  }
}

// ─── Female hair ───────────────────────────────────────────────────────────────
// Styles: 0 = long curtains, 1 = bun, 2 = ponytail, 3 = pixie
function FemaleHairBack({ style, color }) {
  switch (style) {
    case 1: // bun — small side panels for frame
      return (
        <>
          <ellipse cx="11" cy="13" rx="2.5" ry="6"   fill={color} />
          <ellipse cx="29" cy="13" rx="2.5" ry="6"   fill={color} />
        </>
      );
    case 2: // ponytail — one long side panel + the tail
      return (
        <>
          <ellipse cx="11" cy="15" rx="3"   ry="8"   fill={color} />
          {/* Ponytail: rotated oval sweeping to the right */}
          <ellipse
            cx="33" cy="17" rx="4" ry="10"
            fill={color}
            transform="rotate(15, 33, 17)"
          />
        </>
      );
    case 3: // pixie — minimal ear-level side coverage
      return (
        <>
          <ellipse cx="11" cy="13" rx="2.5" ry="5"   fill={color} />
          <ellipse cx="29" cy="13" rx="2.5" ry="5"   fill={color} />
        </>
      );
    default: // 0: long curtains — full side panels
      return (
        <>
          <ellipse cx="11" cy="16" rx="3.5" ry="10"  fill={color} />
          <ellipse cx="29" cy="16" rx="3.5" ry="10"  fill={color} />
        </>
      );
  }
}

function FemaleHairFront({ style, color }) {
  // Shared scalp cap (all styles have some top coverage)
  const cap = <path d="M12 10 Q12 3 20 3 Q28 3 28 10 Z" fill={color} />;

  switch (style) {
    case 1: // bun — cap + prominent round knot sitting on top
      return (
        <>
          {cap}
          <circle cx="20" cy="-1" r="6.5" fill={color} />
        </>
      );
    case 3: // pixie — tighter, shorter cap
      return (
        <path
          d="M12 10 Q12 4 20 4 Q28 4 28 10 Q25 8 20 8 Q15 8 12 10 Z"
          fill={color}
        />
      );
    default: // 0 long curtains, 2 ponytail — standard cap
      return cap;
  }
}

// ─── Body ──────────────────────────────────────────────────────────────────────
function MaleBody({ color }) {
  return (
    <>
      <rect x="13" y="22" width="14" height="15" rx="2"   fill={color} />
      <rect x="4"  y="23" width="9"  height="5"  rx="2"   fill={color} />
      <rect x="27" y="23" width="9"  height="5"  rx="2"   fill={color} />
      <rect x="13" y="37" width="6"  height="11" rx="1"   fill={LEGS_MALE} />
      <rect x="21" y="37" width="6"  height="11" rx="1"   fill={LEGS_MALE} />
      <rect x="11" y="46" width="8"  height="5"  rx="2.5" fill={SHOE} />
      <rect x="21" y="46" width="8"  height="5"  rx="2.5" fill={SHOE} />
    </>
  );
}

function FemaleBody({ color }) {
  return (
    <>
      <rect x="13" y="22" width="14" height="13" rx="2"   fill={color} />
      <rect x="4"  y="23" width="9"  height="5"  rx="2"   fill={color} />
      <rect x="27" y="23" width="9"  height="5"  rx="2"   fill={color} />
      <path d="M11 35 Q20 40 29 35 L31 51 L9 51 Z"        fill={LEGS_FEMALE} />
      <rect x="13" y="47" width="5"  height="5"  rx="2.5" fill={SHOE} />
      <rect x="22" y="47" width="5"  height="5"  rx="2.5" fill={SHOE} />
    </>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
export function PersonAvatar({ person, size = 44, showLabel = true, dragging = false }) {
  const teamColor  = person.teamColor  || '#BBBBBB';
  const skillColor = SKILL_COLORS[person.skill] || '#BBBBBB';
  const hairColor  = person.hairColor  || '#6B4226';
  const hairstyle  = person.hairstyle  ?? 0;
  const isFemale   = person.gender === 'female';
  const svgH       = Math.round(size * 1.3);

  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ width: size }}
      title={`${person.name}${person.skill ? ` · ${person.skill}` : ''}${person.department ? ` · ${person.department}` : ''}`}
    >
      <svg
        width={size}
        height={svgH}
        viewBox="0 0 40 52"
        style={{
          transform:  dragging ? 'scale(1.15)' : undefined,
          filter:     dragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))' : undefined,
          transition: 'transform 0.15s, filter 0.15s',
        }}
      >
        {/* ── Layer 1: back hair (sides / ponytail — behind head) ── */}
        {isFemale
          ? <FemaleHairBack style={hairstyle} color={hairColor} />
          : <MaleHairBack   style={hairstyle} color={hairColor} />
        }

        {/* ── Layer 2: head circle ── */}
        <circle cx="20" cy="11" r="9" fill={HEAD_FILL} stroke={HEAD_STROKE} strokeWidth="1" />

        {/* ── Layer 3: front/scalp hair (drawn on top of head) ── */}
        {isFemale
          ? <FemaleHairFront style={hairstyle} color={hairColor} />
          : <MaleHairFront   style={hairstyle} color={hairColor} />
        }

        {/* ── Layer 4: face (over hair so it's always readable) ── */}
        <circle cx="16.5" cy="11" r="1.5" fill={EYE_FILL} />
        <circle cx="23.5" cy="11" r="1.5" fill={EYE_FILL} />
        <path d="M16 15 Q20 18 24 15" stroke={MOUTH} strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* ── Layer 5: body ── */}
        {isFemale ? <FemaleBody color={teamColor} /> : <MaleBody color={teamColor} />}

        {/* ── Layer 6: skill badge (always on top) ── */}
        <circle
          cx="33" cy="5" r="5.5"
          fill={skillColor}
          stroke="#FFFFFF"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.15))' }}
        />
      </svg>

      {showLabel && (
        <span
          className="text-center leading-tight mt-0.5 block"
          style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '9px', color: '#1A1A1A', maxWidth: size, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {person.name.slice(0, 12)}
        </span>
      )}
      {showLabel && person.department && (
        <span
          className="rounded-full px-1.5 text-center block mt-0.5"
          style={{ background: `${teamColor}18`, color: teamColor, fontSize: '7px', fontFamily: "'Nunito', sans-serif", maxWidth: size, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {person.department}
        </span>
      )}
    </div>
  );
}
