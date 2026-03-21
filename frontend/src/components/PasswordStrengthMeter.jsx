import React, { useMemo } from 'react';

// ── Scoring logic ─────────────────────────────────────────────────────────────
const calcStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '', checks: getChecks('') };

  const checks = getChecks(password);
  const passed  = Object.values(checks).filter(Boolean).length;

  // score 0-4
  const score =
    passed <= 1 ? 1 :
    passed === 2 ? 2 :
    passed === 3 ? 3 : 4;

  const meta = [
    null,
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Fair',   color: '#f59e0b' },
    { label: 'Good',   color: '#3b82f6' },
    { label: 'Strong', color: '#10b981' },
  ][score];

  return { score, ...meta, checks };
};

const getChecks = (pw) => ({
  length:  pw.length >= 8,
  upper:   /[A-Z]/.test(pw),
  lower:   /[a-z]/.test(pw),
  number:  /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

// ── Component ─────────────────────────────────────────────────────────────────
const PasswordStrengthMeter = ({ password }) => {
  const { score, label, color, checks } = useMemo(() => calcStrength(password), [password]);

  if (!password) return null;

  const segments = [1, 2, 3, 4];

  const criteria = [
    { key: 'length',  text: 'At least 8 characters' },
    { key: 'upper',   text: 'Uppercase letter (A-Z)'  },
    { key: 'lower',   text: 'Lowercase letter (a-z)'  },
    { key: 'number',  text: 'Number (0-9)'            },
    { key: 'special', text: 'Special character (!@#…)' },
  ];

  return (
    <div style={{ marginTop: '10px' }}>

      {/* Segment bar + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
          {segments.map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '99px',
                background: s <= score ? color : 'rgba(255,255,255,0.10)',
                transition: 'background 0.3s ease',
                boxShadow: s <= score ? `0 0 6px ${color}66` : 'none',
              }}
            />
          ))}
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: color || 'transparent',
          letterSpacing: '0.04em',
          minWidth: '42px',
          textAlign: 'right',
          transition: 'color 0.3s ease',
        }}>
          {label}
        </span>
      </div>

      {/* Criteria checklist */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 12px',
      }}>
        {criteria.map(({ key, text }) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: checks[key] ? '#10b981' : 'rgba(255,255,255,0.30)',
            transition: 'color 0.25s ease',
          }}>
            <span style={{ fontSize: '0.65rem' }}>
              {checks[key] ? '✓' : '○'}
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
