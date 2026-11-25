"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// Helper hook to load dropdown data (classes, sections, subjects)
function useDropdowns() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { token } = useAuth(); // assume token from auth hook

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, sRes, subRes] = await Promise.all([
          axios.get("/api/class", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/section", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/subject", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setClasses(cRes.data);
        setSections(sRes.data);
        setSubjects(subRes.data);
      } catch (e) {
        console.error("Failed to load dropdown data", e);
      }
    }
    fetchData();
  }, [token]);

  return { classes, sections, subjects };
}

export default function HomeworkUploadPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const { classes, sections, subjects } = useDropdowns();

  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !classId || !subjectId) {
      toast.error("Title, class and subject are required");
      return;
    }
    const form = new FormData();
    form.append("title", title);
    form.append("classId", classId);
    if (sectionId) form.append("sectionId", sectionId);
    form.append("subjectId", subjectId);
    form.append("description", description);
    if (dueDate) form.append("dueDate", dueDate);
    if (file) form.append("file", file);

    setLoading(true);
    try {
      await axios.post("/api/homework", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Homework created successfully");
      // reset form
      setTitle("");
      setClassId("");
      setSectionId("");
      setSubjectId("");
      setDescription("");
      setDueDate("");
      setFile(null);
      router.refresh(); // refresh list if component is on same page
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create homework");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isTeacher) {
    return <p>You do not have permission to create homework.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Homework Assignment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" htmlFor="title">Title *</label>
          <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="class">Class *</label>
          <select id="class" value={classId} onChange={e => setClassId(e.target.value)} required className="w-full border rounded p-2">
            <option value="">Select class</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="section">Section</label>
          <select id="section" value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full border rounded p-2">
            <option value="">Select section (optional)</option>
            {sections.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="subject">Subject *</label>
          <select id="subject" value={subjectId} onChange={e => setSubjectId(e.target.value)} required className="w-full border rounded p-2">
            <option value="">Select subject</option>
            {subjects.map(sub => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="description">Description / Instructions</label>
          <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="dueDate">Submission Deadline</label>
          <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="file">Attach File</label>
          <input id="file" type="file" onChange={e => setFile(e.target.files[0])} className="w-full" />
        </div>
        <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          {loading ? "Saving..." : "Create Homework"}
        </button>
      </form>
    </div>
  );
}
