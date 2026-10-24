'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CloudRain, CloudLightning, CloudDrizzle, Umbrella, X, MapPin, Droplets, Clock, BellOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Rain Alert Popup
 * ----------------
 * Checks today's live forecast (Open-Meteo, no API key needed) for the school's
 * location and shows an English popup when rain is expected today.
 * Shown to Super Admin, Admin, Teacher and Student roles - once per day per user
 * (unless "Remind me later" is chosen, which re-shows it after 3 hours).
 *
 * Testing: append `?rainTest=1` to any dashboard URL to force the popup.
 */

// Pak Royal College - Lal Puli Stop, Main Jaranwala Road, Sharaqpur Sharif, District Sheikhupura
const SCHOOL_LOCATION = {
  name: 'Sharaqpur Sharif, Sheikhupura',
  latitude: 31.4627,
  longitude: 74.1003,
};

const ALLOWED_ROLES = ['super admin', 'admin', 'teacher', 'student'];
const REMIND_LATER_MS = 3 * 60 * 60 * 1000;
const RECHECK_MS = 30 * 60 * 1000;

// WMO weather codes that mean rain / drizzle / showers / thunderstorm
const isRainCode = (code) =>
  (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99);

const describeCode = (code) => {
  if (code >= 95) return 'Thunderstorm';
  if (code >= 80) return 'Rain Showers';
  if (code >= 61 && code <= 67) return code >= 65 ? 'Heavy Rain' : 'Rain';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code === 3) return 'Overcast';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  return 'Clear';
};

const getIntensity = (sum, prob, code) => {
  if (code >= 95 || sum >= 10) return { label: 'Heavy', color: 'bg-red-600' };
  if (code >= 63 || sum >= 3 || prob >= 80) return { label: 'Moderate', color: 'bg-amber-500' };
  return { label: 'Light', color: 'bg-sky-500' };
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatHour = (iso) => {
  const h = new Date(iso).getHours();
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 === 0 ? 12 : h % 12} ${suffix}`;
};

export default function RainAlertPopup() {
  const { user, isAuthenticated } = useAuth();
  const [alert, setAlert] = useState(null);
  const [visible, setVisible] = useState(false);

  const role = String(user?.role || '').toLowerCase();
  const userKey = user?._id || user?.id || user?.email || user?.username || 'user';
  const storageKey = `stoofi_rain_alert_${userKey}_${todayKey()}`;

  const checkForecast = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const forceTest = new URLSearchParams(window.location.search).get('rainTest') === '1';

    // Respect dismissal for today
    if (!forceTest) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved?.dismissed) return;
        if (saved?.remindAt && Date.now() < saved.remindAt) return;
      } catch (e) {}
    }

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${SCHOOL_LOCATION.latitude}` +
        `&longitude=${SCHOOL_LOCATION.longitude}` +
        `&daily=weather_code,precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min` +
        `&hourly=precipitation_probability,precipitation,weather_code` +
        `&current=temperature_2m,weather_code` +
        `&timezone=Asia%2FKarachi&forecast_days=1`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Forecast unavailable');
      const data = await res.json();

      const code = data?.daily?.weather_code?.[0] ?? 0;
      const sum = data?.daily?.precipitation_sum?.[0] ?? 0;
      const prob = data?.daily?.precipitation_probability_max?.[0] ?? 0;
      const rainExpected = isRainCode(code) || sum >= 0.5 || prob >= 60;

      if (!rainExpected && !forceTest) {
        setAlert(null);
        setVisible(false);
        return;
      }

      // Find upcoming hours (from now) with rain likelihood
      const now = Date.now() - 60 * 60 * 1000;
      const hours = (data?.hourly?.time || [])
        .map((t, i) => ({
          time: t,
          prob: data.hourly.precipitation_probability?.[i] ?? 0,
          mm: data.hourly.precipitation?.[i] ?? 0,
          code: data.hourly.weather_code?.[i] ?? 0,
        }))
        .filter((h) => new Date(h.time).getTime() >= now && (h.prob >= 40 || h.mm > 0.1 || isRainCode(h.code)))
        .slice(0, 6);

      setAlert({
        code: forceTest && !rainExpected ? 61 : code,
        sum,
        prob: forceTest && !rainExpected ? Math.max(prob, 70) : prob,
        tMax: data?.daily?.temperature_2m_max?.[0],
        tMin: data?.daily?.temperature_2m_min?.[0],
        current: data?.current?.temperature_2m,
        hours,
        isTest: forceTest && !rainExpected,
      });
      setVisible(true);
    } catch (err) {
      console.warn('Rain alert forecast check failed:', err?.message);
      if (forceTest) {
        setAlert({ code: 61, sum: 0, prob: 70, hours: [], isTest: true });
        setVisible(true);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isAuthenticated || !ALLOWED_ROLES.includes(role)) return;
    checkForecast();
    const interval = setInterval(checkForecast, RECHECK_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, role, checkForecast]);

  const dismiss = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ dismissed: true })); } catch (e) {}
    setVisible(false);
  };

  const remindLater = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ remindAt: Date.now() + REMIND_LATER_MS })); } catch (e) {}
    setVisible(false);
  };

  if (!visible || !alert || !isAuthenticated || !ALLOWED_ROLES.includes(role)) return null;

  const intensity = getIntensity(alert.sum, alert.prob, alert.code);
  const Icon = alert.code >= 95 ? CloudLightning : alert.code >= 51 && alert.code <= 57 ? CloudDrizzle : CloudRain;
  const name = user?.firstName || user?.fullName || user?.name || 'there';

  const roleTip = {
    'super admin': 'Consider notifying parents and staff about possible delays and reviewing transport routes.',
    admin: 'Consider notifying parents and staff about possible delays and reviewing transport routes.',
    teacher: 'Plan indoor activities and expect some students may arrive late.',
    student: 'Carry an umbrella or raincoat and leave home a little early today.',
  }[role];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        role="alertdialog"
        aria-labelledby="rain-alert-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#084A86] via-sky-700 to-sky-500 px-6 pt-6 pb-8 text-white overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-25">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute w-px h-5 bg-white animate-bounce"
                style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 90}%`, animationDelay: `${(i % 6) * 0.15}s` }}
              />
            ))}
          </div>
          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Icon className="w-9 h-9" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-sky-100">Weather Alert</p>
              <h2 id="rain-alert-title" className="text-2xl font-extrabold leading-tight">
                Rain Expected Today
              </h2>
              <p className="mt-1 flex items-center gap-1 text-xs text-sky-100">
                <MapPin className="w-3.5 h-3.5" /> {SCHOOL_LOCATION.name}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-zinc-700">
            Hello <span className="font-bold text-zinc-950">{name}</span>, the forecast shows{' '}
            <span className="font-bold text-zinc-950">{describeCode(alert.code).toLowerCase()}</span> in the school
            area today. {roleTip}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <Droplets className="w-4 h-4 mx-auto text-sky-600" />
              <p className="mt-1 text-lg font-extrabold text-zinc-950">{Math.round(alert.prob)}%</p>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Chance</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <Umbrella className="w-4 h-4 mx-auto text-sky-600" />
              <p className="mt-1 text-lg font-extrabold text-zinc-950">{Number(alert.sum || 0).toFixed(1)}mm</p>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Rainfall</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${intensity.color}`} />
              <p className="mt-1 text-lg font-extrabold text-zinc-950">{intensity.label}</p>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Intensity</p>
            </div>
          </div>

          {alert.hours?.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                <Clock className="w-3.5 h-3.5" /> Expected rain hours
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {alert.hours.map((h) => (
                  <div key={h.time} className="shrink-0 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-center">
                    <p className="text-[11px] font-bold text-zinc-950">{formatHour(h.time)}</p>
                    <p className="text-[11px] font-semibold text-sky-700">{Math.round(h.prob)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {typeof alert.tMax === 'number' && (
            <p className="text-xs text-zinc-500">
              Temperature today: <span className="font-bold text-zinc-900">{Math.round(alert.tMin)}°C – {Math.round(alert.tMax)}°C</span>
              {typeof alert.current === 'number' && <> · Now <span className="font-bold text-zinc-900">{Math.round(alert.current)}°C</span></>}
            </p>
          )}

          {alert.isTest && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-700">
              Test mode: this popup was forced with ?rainTest=1.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={remindLater}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              <BellOff className="w-4 h-4" /> Remind me later
            </button>
            <button
              onClick={dismiss}
              className="flex-1 rounded-xl bg-[#084A86] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#063a6a] transition-colors shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
