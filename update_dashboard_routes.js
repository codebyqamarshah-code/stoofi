const fs = require('fs');
let content = fs.readFileSync('server/src/routes/dashboard.routes.js', 'utf8');

content = content.replace(
  "  deleteTodo \n} = require('../controllers/dashboard.controller');",
  "  deleteTodo,\n  getLiveUpdates \n} = require('../controllers/dashboard.controller');"
);

content = content.replace(
  "router.get('/stats', getDashboardStats);",
  "router.get('/stats', getDashboardStats);\nrouter.get('/live-updates', getLiveUpdates);"
);

fs.writeFileSync('server/src/routes/dashboard.routes.js', content);
