const fs = require('fs');
const path = require('path');

const basePath = 'c:/Users/QAMAR SHAH/Desktop/eskooly admin/client/app/dashboard/admin';
const pages = [
  { file: 'visitor-book/page.js', state: 'visitors', setter: 'setVisitors', key: 'eskooly_visitors' },
  { file: 'phone-call-log/page.js', state: 'logs', setter: 'setLogs', key: 'eskooly_call_logs' },
  { file: 'postal-dispatch/page.js', state: 'postalDispatches', setter: 'setPostalDispatches', key: 'eskooly_postal_dispatch' },
  { file: 'postal-receive/page.js', state: 'postalReceives', setter: 'setPostalReceives', key: 'eskooly_postal_receive' },
  { file: 'complaint/page.js', state: 'complaints', setter: 'setComplaints', key: 'eskooly_complaints' },
  { file: 'setup/page.js', state: 'setups', setter: 'setSetups', key: 'eskooly_admin_setup' },
  { file: 'id-card/page.js', state: 'cards', setter: 'setCards', key: 'eskooly_id_cards' },
  { file: 'certificate/page.js', state: 'cards', setter: 'setCards', key: 'eskooly_certificates' },
  { file: 'admission-query/page.js', state: 'queries', setter: 'setQueries', key: 'eskooly_admission_queries' }
];

pages.forEach(({file, state, setter, key}) => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Safely add useEffect to React imports
    content = content.replace(/import React, \{([^}]+)\} from 'react';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('useEffect')) imports.push('useEffect');
      return `import React, { ${imports.join(', ')} } from 'react';`;
    });
    
    // Add persistence logic
    if (!content.includes(`localStorage.getItem('${key}')`)) {
      const stateDecl = `const [${state}, ${setter}] = useState([]);`;
      
      const persistenceLogic = `
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('${key}');
    if (saved) {
      try { ${setter}(JSON.parse(saved)); } catch(e) {}
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('${key}', JSON.stringify(${state}));
    }
  }, [${state}, isMounted]);
`;
      
      content = content.replace(stateDecl, stateDecl + '\n' + persistenceLogic);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('Not found ' + file);
  }
});
