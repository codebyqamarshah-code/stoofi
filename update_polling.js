const fs = require('fs');
let content = fs.readFileSync('client/components/DashboardUI.jsx', 'utf8');

content = content.replace(
  /fetchDashboardStats\(\);\s*\}, \[\]\);/,
  "fetchDashboardStats();\n    const interval = setInterval(fetchDashboardStats, 15000);\n    return () => clearInterval(interval);\n  }, []);"
);

fs.writeFileSync('client/components/DashboardUI.jsx', content);
