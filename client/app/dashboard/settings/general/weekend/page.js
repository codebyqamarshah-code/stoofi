'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const DEFAULT_DAYS = [
  { id: 1, name: 'Saturday', isWeekend: true },
  { id: 2, name: 'Sunday', isWeekend: true },
  { id: 3, name: 'Monday', isWeekend: false },
  { id: 4, name: 'Tuesday', isWeekend: false },
  { id: 5, name: 'Wednesday', isWeekend: false },
  { id: 6, name: 'Thursday', isWeekend: false },
  { id: 7, name: 'Friday', isWeekend: false },
];

export default function Weekend() {
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/setting');
      if (res?.success && Array.isArray(res.data?.weekendSettings) && res.data.weekendSettings.length > 0) {
        setDays(res.data.weekendSettings);
      }
    } catch (e) {
      console.error('Failed to load weekend settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await api.put('/setting', {
        weekendSettings: days
      });
      if (res?.success) {
        setSuccessMsg('Weekend days updated and saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        alert(res?.message || 'Failed to save weekend settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving weekend settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (id) => {
    setDays(days.map(day => day.id === id ? { ...day, isWeekend: !day.isWeekend } : day));
  };

  return (
    <div className="min-h-screen bg-white p-6 text-zinc-950">
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>General Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-950 font-bold">Weekend Setup</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Weekend Setup</h1>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving...' : 'Save Weekend Setup'}</span>
        </Button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs max-w-4xl overflow-hidden mb-6">
        <div className="border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-950">Active Week Days & Weekends</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Designate which days are off-days (weekends) for attendance, timetable routines, and staff duty.</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {days.filter(d => d.isWeekend).length} Days Off
          </span>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading weekend settings...
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs font-bold text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3">DAY NAME</th>
                  <th className="px-6 py-3">OFF DAY / WEEKEND STATUS</th>
                  <th className="px-6 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {days.map((day) => (
                  <tr key={day.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-950">{day.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                        day.isWeekend ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {day.isWeekend ? 'Weekend (Holiday)' : 'Working Day'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${day.isWeekend ? 'bg-emerald-600' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${day.isWeekend ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
