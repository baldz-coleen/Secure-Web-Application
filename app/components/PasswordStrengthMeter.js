'use client';

import { useMemo } from 'react';

function getStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];
  const levels = ['', 'password-strength-weak', 'password-strength-fair', 'password-strength-good', 'password-strength-strong', 'password-strength-strong'];
  return { score: Math.min(score, 5), label: labels[score], level: levels[score] };
}

export default function PasswordStrengthMeter({ password }) {
  const { score, label, level } = useMemo(() => getStrength(password || ''), [password]);
  if (!password) return null;
  return (
    <div className="password-strength-wrap">
      <div className="password-strength">
        <div className={`password-strength-bar ${level}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <div className="password-strength-label">{label}</div>
    </div>
  );
}
