'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Nav from '@/app/components/Nav';
import PasswordStrengthMeter from '@/app/components/PasswordStrengthMeter';
import EyeToggle from '@/app/components/EyeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        if (data.details) setFieldErrors(data.details);
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <Nav user={null} />
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <h1 className="card-title">Create account</h1>
          <p className="card-description">
            Use a strong password (8+ chars, upper, lower, number, symbol).
          </p>
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && <div className="form-error">{fieldErrors.email[0]}</div>}
            </div>
            <div className="password-fields-group">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <EyeToggle
                    visible={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    ariaLabel={showPassword ? 'Hide password' : 'Show password'}
                  />
                </div>
                <PasswordStrengthMeter password={password} />
                {fieldErrors.password && <div className="form-error">{fieldErrors.password[0]}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="input-with-icon">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <EyeToggle
                    visible={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    ariaLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                  />
                </div>
                {fieldErrors.confirmPassword && <div className="form-error">{fieldErrors.confirmPassword[0]}</div>}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link href="/login" style={{ fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
