const fs = require('fs');
let content = fs.readFileSync('client/components/DashboardUI.jsx', 'utf8');

const targetEffect = `  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dashboard_notices');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNoticesList(parsed);
          }
        }
        const rawTodos = localStorage.getItem('dashboard_todos');
        if (rawTodos) {
          const parsedTodos = JSON.parse(rawTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            setTodos(parsedTodos);
          }
        }
      } catch (_) {}
    }
    fetchDashboardStats();
  }, []);`;

const replaceEffect = `  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('dashboard_notices');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNoticesList(parsed);
          }
        }
        const rawTodos = localStorage.getItem('dashboard_todos');
        if (rawTodos) {
          const parsedTodos = JSON.parse(rawTodos);
          if (Array.isArray(parsedTodos) && parsedTodos.length > 0) {
            setTodos(parsedTodos);
          }
        }
      } catch (_) {}
    }
    fetchDashboardStats();
    
    // Live update polling for dashboard stats every 15 seconds
    const statsInterval = setInterval(fetchDashboardStats, 15000);
    return () => clearInterval(statsInterval);
  }, []);`;

content = content.replace(targetEffect, replaceEffect);
fs.writeFileSync('client/components/DashboardUI.jsx', content);
