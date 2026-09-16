const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/layout.js', 'utf8');

const oldLogic = `    if (!storedToken && !user && !isAuthenticated) {
      redirectedRef.current = true;
      router.replace('/login');
    }`;

const newLogic = `    if (!storedToken && !user && !isAuthenticated) {
      redirectedRef.current = true;
      router.replace('/login');
    } else if (!isLoading && !isAuthenticated) {
      redirectedRef.current = true;
      router.replace('/login');
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('client/app/dashboard/layout.js', content);
