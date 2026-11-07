'use client';

import Link from 'next/link';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronRight,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Bus,
  Layers,
  Navigation
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

// ─── Leaflet Map Loader (Dynamic CDN injection to protect Next.js build) ──────────
function loadLeafletCDN() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Window undefined'));
    if (window.L) return resolve(window.L);

    if (!document.querySelector('#leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

// ─── Interactive Transport Map Component ─────────────────────────────────────────
function RouteMap({ routes, selectedRoute, onSelectRoute }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadLeafletCDN()
      .then((L) => {
        if (!isMounted || !mapRef.current) return;

        if (!mapInstance.current) {
          // Pak Royal College Campus Coordinates (Lal Puli, Sharqpur / Sheikhupura)
          const campusCoord = [31.7167, 73.9851];
          const map = L.map(mapRef.current, {
            center: campusCoord,
            zoom: 12,
            scrollWheelZoom: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map);

          layerGroupRef.current = L.layerGroup().addTo(map);
          mapInstance.current = map;
          setMapLoaded(true);
        }

        renderMapLayers(L);
      })
      .catch((err) => {
        console.warn('Map initialization note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [routes, selectedRoute]);

  const renderMapLayers = (L) => {
    if (!mapInstance.current || !layerGroupRef.current) return;
    const group = layerGroupRef.current;
    group.clearLayers();

    // Campus Main Hub Marker
    const campusIcon = L.divIcon({
      html: `
        <div style="background:#084A86;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 10px rgba(8,74,134,0.45);border:2.5px solid #ffffff;">
          🏫
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const campusMarker = L.marker([31.7167, 73.9851], { icon: campusIcon })
      .bindPopup(`
        <div style="padding:4px;font-family:sans-serif;">
          <h4 style="margin:0 0 4px;color:#084A86;font-size:13px;font-weight:bold;">Pak Royal College</h4>
          <p style="margin:0;font-size:11px;color:#555;">Central Transport Terminal & Main Campus</p>
          <span style="display:inline-block;margin-top:4px;font-size:10px;background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:4px;font-weight:600;">Main Hub</span>
        </div>
      `);
    group.addLayer(campusMarker);

    const routesToDisplay = selectedRoute ? [selectedRoute] : routes;

    const routeColors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    routesToDisplay.forEach((route, idx) => {
      const color = routeColors[idx % routeColors.length];
      const isSelected = selectedRoute && selectedRoute._id === route._id;

      if (Array.isArray(route.stops) && route.stops.length > 0) {
        const latLngs = [];

        route.stops.forEach((stop, si) => {
          if (!stop.lat || !stop.lng) return;
          latLngs.push([stop.lat, stop.lng]);

          const stopIcon = L.divIcon({
            html: `
              <div style="background:${isSelected ? '#084A86' : color};color:#ffffff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #ffffff;">
                ${si + 1}
              </div>
            `,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
            .bindPopup(`
              <div style="padding:4px;font-family:sans-serif;">
                <h4 style="margin:0 0 2px;font-size:12px;font-weight:bold;color:#1e293b;">${stop.name || `Stop ${si + 1}`}</h4>
                <p style="margin:0;font-size:11px;color:#64748b;">${route.title}</p>
                <p style="margin:3px 0 0;font-size:11px;font-weight:bold;color:#084A86;">Fare: $${route.fare ?? 0}</p>
              </div>
            `);
          group.addLayer(stopMarker);
        });

        if (latLngs.length > 1) {
          const polyline = L.polyline(latLngs, {
            color: isSelected ? '#084A86' : color,
            weight: isSelected ? 5 : 3.5,
            opacity: isSelected ? 0.95 : 0.75,
            dashArray: isSelected ? null : '6, 6',
          }).bindPopup(`<b>${route.title}</b><br/>Fare: $${route.fare ?? 0}`);
          group.addLayer(polyline);

          if (isSelected) {
            mapInstance.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          }
        }
      }
    });
  };

  const resetView = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([31.7167, 73.9851], 12);
      if (onSelectRoute) onSelectRoute(null);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-xs bg-zinc-50">
      {/* Map Control Overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {selectedRoute && (
          <button
            onClick={resetView}
            className="bg-white/95 backdrop-blur-xs text-[#084A86] border border-zinc-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-zinc-50 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" /> Reset View
          </button>
        )}
        <div className="bg-white/95 backdrop-blur-xs border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#084A86]" />
          <span>{routes.length} Active Route{routes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div ref={mapRef} style={{ height: '320px', width: '100%' }} />

      {!mapLoaded && (
        <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center text-xs text-zinc-500 gap-2">
          <div className="w-4 h-4 border-2 border-[#084A86] border-t-transparent rounded-full animate-spin" />
          <span>Loading Route Map...</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({ title: '', fare: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', fare: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transport-route');
      if (res?.success && Array.isArray(res.data)) {
        setRoutes(res.data);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Route Title is required');
      return;
    }
    if (formData.fare === '' || isNaN(Number(formData.fare))) {
      alert('Valid Fare ($) is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/transport-route', {
        title: formData.title.trim(),
        fare: Number(formData.fare)
      });
      if (res?.success) {
        setFormData({ title: '', fare: '' });
        showNotification('success', 'Route saved successfully!');
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to save route');
      }
    } catch (error) {
      alert(error?.response?.data?.message || error.message || 'Error saving route');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setEditFormData({ title: route.title || '', fare: route.fare ?? '' });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim()) return alert('Route Title is required');
    try {
      setEditSaving(true);
      const res = await api.put(`/transport-route/${editingRoute._id}`, {
        title: editFormData.title.trim(),
        fare: Number(editFormData.fare) || 0
      });
      if (res?.success) {
        setIsEditOpen(false);
        showNotification('success', 'Route updated successfully!');
        fetchRoutes();
      } else {
        alert(res?.message || 'Failed to update route');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to update route');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this route?')) {
      try {
        const res = await api.delete(`/transport-route/${id}`);
        if (res?.success) {
          showNotification('success', 'Route deleted successfully!');
          if (selectedRoute?._id === id) setSelectedRoute(null);
          fetchRoutes();
        } else {
          alert(res?.message || 'Failed to delete route');
        }
      } catch (error) {
        alert(error?.response?.data?.message || error.message || 'Error deleting route');
      }
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(r =>
      (r.title || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize));
  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPage]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Breadcrumbs matching reference screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-[#0c3559] tracking-tight">Routes</h1>
        <div className="flex items-center text-xs text-zinc-400 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <Link href="/dashboard/transport/routes" className="hover:text-zinc-600 transition-colors">Transport</Link>
          <ChevronRight className="h-3 w-3 mx-1 text-zinc-400" />
          <span className="text-zinc-700 font-semibold">Routes</span>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Interactive Live Route Map Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#084A86]" />
            <h3 className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
              Transport GIS & Route Network
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">
            Click on any route below to view its pathway
          </span>
        </div>
        <RouteMap
          routes={routes}
          selectedRoute={selectedRoute}
          onSelectRoute={setSelectedRoute}
        />
      </div>

      {/* Main Grid: Add Route (Left) and Route List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add Route Form */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-2">
              <Bus className="h-4 w-4 text-[#084A86]" />
              <h2 className="text-base font-bold text-[#0c3559]">Add Route</h2>
            </div>

            <form className="p-5 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  ROUTE TITLE <span className="text-rose-500">*</span>
                </Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sharqpur Road to Campus"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white focus-visible:ring-1 focus-visible:ring-[#084A86]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">
                  FARE ($) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  placeholder="e.g. 1500"
                  className="h-10 border-zinc-200 rounded-lg text-sm bg-white focus-visible:ring-1 focus-visible:ring-[#084A86]"
                  required
                />
              </div>

              <button
                disabled={submitting}
                type="submit"
                style={{ backgroundColor: '#084A86' }}
                className="w-full hover:opacity-95 text-white font-bold h-10 rounded-lg shadow-xs cursor-pointer uppercase tracking-wider text-xs transition-opacity disabled:opacity-50"
              >
                {submitting ? 'SAVING...' : 'SAVE ROUTE'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Route List Table */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base font-bold text-[#0c3559]">Route List</h2>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <Input
                  placeholder="SEARCH"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="pl-8.5 h-8.5 text-xs bg-white border-zinc-200 rounded-lg uppercase tracking-wider text-zinc-700 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-[#0c3559] uppercase font-bold bg-[#f8fafc] border-b border-zinc-100">
                  <tr>
                    <th className="px-5 py-3 font-bold w-16">SL</th>
                    <th className="px-5 py-3 font-bold">ROUTE TITLE</th>
                    <th className="px-5 py-3 font-bold">FARE ($)</th>
                    <th className="px-5 py-3 font-bold text-right w-24">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-16 text-center text-zinc-400">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                          <span>Loading routes...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredRoutes.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-5 py-16 text-center text-sm font-medium text-zinc-400">
                        No Data Available In Table
                      </td>
                    </tr>
                  ) : (
                    paginatedRoutes.map((route, idx) => {
                      const isSelected = selectedRoute?._id === route._id;
                      return (
                        <tr
                          key={route._id}
                          onClick={() => setSelectedRoute(isSelected ? null : route)}
                          className={`hover:bg-blue-50/60 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/80 font-medium' : ''
                          }`}
                        >
                          <td className="px-5 py-3.5 text-zinc-600 font-semibold">
                            {(currentPage - 1) * pageSize + idx + 1}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-[#0c3559]">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#084A86] scale-125' : 'bg-zinc-300'}`} />
                              <span>{route.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-zinc-800 font-semibold font-mono">
                            ${Number(route.fare || 0).toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenEdit(route); }}
                                className="p-1.5 text-zinc-400 hover:text-[#084A86] hover:bg-zinc-100 rounded-md transition"
                                title="Edit Route"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(route._id); }}
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-md transition"
                                title="Delete Route"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer with green active circle indicator matching reference */}
            <div className="p-4 border-t border-zinc-100 flex items-center justify-center">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                      currentPage === i + 1
                        ? 'border-2 border-emerald-500 bg-white text-emerald-600 shadow-2xs'
                        : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Route Modal */}
      {isEditOpen && editingRoute && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-sm w-full p-5 text-zinc-950 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-[#0c3559] uppercase tracking-wider">
                Edit Route
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">ROUTE TITLE *</Label>
                <Input
                  value={editFormData.title}
                  onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#0c3559] uppercase tracking-wider">FARE ($) *</Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={editFormData.fare}
                  onChange={e => setEditFormData({ ...editFormData, fare: e.target.value })}
                  className="h-10 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs h-9 px-4 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{ backgroundColor: '#084A86' }}
                  className="hover:opacity-95 text-white font-bold text-xs h-9 px-4 rounded-lg cursor-pointer"
                >
                  {editSaving ? 'Updating...' : 'Update Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
