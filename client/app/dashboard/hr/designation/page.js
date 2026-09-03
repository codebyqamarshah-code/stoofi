"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import api from "@/services/api";
import { DataTable } from "@/components/ui/DataTable";
import { CrudForm } from "@/components/ui/CrudForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DesignationPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "" });
  const [editId, setEditId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/designation");
      if (res.success) setRecords(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    try {
      if (editId) {
        await api.put(/designation/ + editId, formData);
      } else {
        await api.post("/designation", formData);
      }
      setFormData({ name: "" });
      setEditId(null);
      fetchRecords(); // Live refresh
    } catch (e) {
      alert("Error: " + e.message);
      throw e;
    }
  };

  const handleEdit = (row) => {
    setFormData({ name: row.name });
    setEditId(row._id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(/designation/ + id);
      fetchRecords(); // Live refresh
    } catch (e) {
      alert("Error deleting record.");
    }
  };

  const columns = [
    { key: "name", label: "Designation Name" }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <span>Dashboard</span> <ChevronRight size={14} /> 
        <span>Human Resource</span> <ChevronRight size={14} /> 
        <span className="text-emerald-600 font-semibold">Designation</span>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Form Section */}
        <div className="w-full xl:w-1/3">
          <CrudForm 
            title={editId ? "Edit Designation" : "Add Designation"} 
            buttonText={editId ? "Update Designation" : "Save Designation"}
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label>Designation Name *</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ name: e.target.value })} 
                placeholder="e.g. Senior Teacher" 
              />
            </div>
            {editId && (
              <button 
                type="button" 
                onClick={() => { setEditId(null); setFormData({ name: "" }); }}
                className="text-xs text-rose-500 mt-2 block hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </CrudForm>
        </div>

        {/* Data Table Section */}
        <div className="w-full xl:w-2/3">
          <DataTable 
            title="Designation List"
            columns={columns} 
            data={records} 
            isLoading={loading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        </div>
      </div>
    </div>
  );
}
