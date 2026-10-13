'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Bus, 
  MapPin, 
  Plus, 
  Users, 
  ArrowUpRight, 
  CheckCircle2, 
  Navigation, 
  Phone, 
  Car,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import api from '@/services/api';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { Button } from '@/components/ui/button';

export default function TransportDashboardHub() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assigns, setAssigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, vRes, aRes] = await Promise.all([
        api.get('/transport-route').catch(() => null),
        api.get('/transport-vehicle').catch(() => null),
        api.get('/transport-assign').catch(() => null)
      ]);

      if (rRes?.success && Array.isArray(rRes.data)) setRoutes(rRes.data);
      if (vRes?.success && Array.isArray(vRes.data)) setVehicles(vRes.data);
      if (aRes?.success && Array.isArray(aRes.data)) setAssigns(aRes.data);
    } catch (err) {
      console.error('Error fetching transport overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute KPIs
  const stats = useMemo(() => {
    const totalRoutes = routes.length;
    const totalVehicles = vehicles.length;
    const totalCapacity = vehicles.reduce((acc, v) => acc + (Number(v.capacity) || 0), 0);
    const totalAssigned = assigns.length;

    return { totalRoutes, totalVehicles, totalCapacity, totalAssigned };
  }, [routes, vehicles, assigns]);

  const getRouteTitle = (id) => routes.find(r => r._id === id)?.title || 'Route';
  const getRouteFare = (id) => routes.find(r => r._id === id)?.fare || 0;
  const getVehicleNo = (id) => vehicles.find(v => v._id === id)?.vehicleNo || 'Vehicle';
  const getVehicleDriver = (id) => vehicles.find(v => v._id === id)?.driverName || 'Driver';
  const getVehicleContact = (id) => vehicles.find(v => v._id === id)?.contact || '—';
  const getVehicleCapacity = (id) => vehicles.find(v => v._id === id)?.capacity || '—';

  // Export configs
  const exportColumns = [
    { key: 'route', label: 'Transport Route' },
    { key: 'vehicleNo', label: 'Vehicle Number' },
    { key: 'capacity', label: 'Seating Capacity' },
    { key: 'driver', label: 'Driver Name' },
    { key: 'contact', label: 'Driver Phone' },
    { key: 'fare', label: 'Monthly Fare (PKR)' }
  ];

  const exportData = assigns.map(a => ({
    route: getRouteTitle(a.routeId),
    vehicleNo: getVehicleNo(a.vehicleId),
    capacity: getVehicleCapacity(a.vehicleId),
    driver: getVehicleDriver(a.vehicleId),
    contact: getVehicleContact(a.vehicleId),
    fare: getRouteFare(a.routeId)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight flex items-center gap-2">
            <Bus className="h-6 w-6 text-[#084A86]" />
            Transport & Fleet Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage school buses, van routes, student pickup stops, driver licenses, and vehicle assignments.
          </p>
        </div>
        <div className="flex items-center text-xs text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3.5 w-3.5 mx-1" />
          <span className="text-zinc-950 font-bold">Transport Hub</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Bus Routes</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalRoutes}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#084A86]">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Fleet Vehicles</div>
            <div className="text-2xl font-black text-zinc-950 mt-1">{stats.totalVehicles}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Buses & Vans</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Bus className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Seating Capacity</div>
            <div className="text-2xl font-black text-[#084A86] mt-1">{stats.totalCapacity}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Student passenger seats</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Assigned Routes</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.totalAssigned}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Active bus lines</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Navigation className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3 Quick Navigation Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link 
          href="/dashboard/transport/routes" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-[#084A86] flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-[#084A86] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Transport Routes & Fares</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Define pickup stops, destination routes, and monthly student transportation fees (PKR).
            </p>
          </div>
          <span className="text-xs font-bold text-[#084A86] mt-4 flex items-center gap-1">
            Manage Routes &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/transport/vehicle" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bus className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-emerald-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Fleet Vehicles & Drivers</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Register school buses, seating capacities, driver names, license numbers, and emergency phone contacts.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 mt-4 flex items-center gap-1">
            Manage Vehicles &rarr;
          </span>
        </Link>

        <Link 
          href="/dashboard/transport/assign-vehicle" 
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs hover:border-[#084A86] transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Navigation className="h-6 w-6" />
              </div>
              <ArrowUpRight className="h-5 w-5 text-zinc-300 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Route & Vehicle Allocation</h3>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Assign specific buses to designated school routes and balance student seating loads.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 mt-4 flex items-center gap-1">
            Assign Fleet &rarr;
          </span>
        </Link>
      </div>

      {/* Route & Fleet Allocation Table */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h2 className="text-base font-bold text-zinc-950 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-[#084A86]" />
              Active Route Allocations & Fleet Roster
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Live overview of routes paired with operating school vehicles</p>
          </div>

          <div className="flex items-center gap-2">
            <TableExportToolbar
              data={exportData}
              columns={exportColumns}
              filename="Transport_Fleet_Allocations"
            />
            <Link href="/dashboard/transport/assign-vehicle">
              <Button 
                size="sm"
                style={{ backgroundColor: '#084A86' }}
                className="hover:opacity-95 text-white font-bold text-xs h-8 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Assign Vehicle
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3.5">SL</th>
                <th className="px-4 py-3.5">Route Title</th>
                <th className="px-4 py-3.5">Vehicle Number</th>
                <th className="px-4 py-3.5">Seating Capacity</th>
                <th className="px-4 py-3.5">Assigned Driver</th>
                <th className="px-4 py-3.5">Driver Contact</th>
                <th className="px-4 py-3.5">Monthly Fare</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-[#084A86] border-t-transparent animate-spin" />
                      Loading transport allocations...
                    </div>
                  </td>
                </tr>
              ) : assigns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-zinc-500">
                    No vehicles assigned to routes yet. Click &quot;Assign Vehicle&quot; to connect a bus to a route.
                  </td>
                </tr>
              ) : (
                assigns.map((a, idx) => (
                  <tr key={a._id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-zinc-500 text-xs">#{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-zinc-950">
                      {getRouteTitle(a.routeId)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#084A86]">
                      {getVehicleNo(a.vehicleId)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-700">
                      {getVehicleCapacity(a.vehicleId)} Seats
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-zinc-900">
                      {getVehicleDriver(a.vehicleId)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 text-xs">
                      {getVehicleContact(a.vehicleId)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-700">
                      PKR {Number(getRouteFare(a.routeId)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Operational
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 bg-zinc-50/30">
          <div>Showing <span className="font-bold text-zinc-900">{assigns.length}</span> active vehicle route assignments</div>
          <Link href="/dashboard/transport/assign-vehicle" className="text-[#084A86] font-bold hover:underline">
            Manage All Allocations &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
