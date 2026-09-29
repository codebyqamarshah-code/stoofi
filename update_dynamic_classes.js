const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'client/app/dashboard/students/add/page.js',
  'client/app/dashboard/students/page.js',
  'client/app/dashboard/students/export/page.js'
];

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. We know these files initialize state like: const [classes, setClasses] = useState(FALLBACK_CLASSES);
    // 2. They might also do: const [sections, setSections] = useState(FALLBACK_SECTIONS);
    
    // Replace state initialization
    content = content.replace(/useState\(FALLBACK_CLASSES\)/g, 'useState([])');
    // For sections, we'll leave it as [] if it was relying on FALLBACK_SECTIONS
    content = content.replace(/useState\(FALLBACK_SECTIONS\)/g, 'useState([])');

    // Remove the fallback constants
    content = content.replace(/const FALLBACK_CLASSES = \[[\s\S]*?\];\n\n/g, '');
    content = content.replace(/const FALLBACK_SECTIONS = \[[\s\S]*?\];\n\n/g, '');

    // Add useEffect to fetch classes if it's not already fetching classes
    if (!content.includes('fetchDynamicClasses')) {
        // Find a good place to inject the fetch function, usually right after state initialization
        const stateInjectPos = content.indexOf('const [classes, setClasses] = useState([]);');
        if (stateInjectPos !== -1) {
            const endOfLine = content.indexOf('\n', stateInjectPos);
            
            const fetchLogic = `
  useEffect(() => {
    const fetchDynamicClasses = async () => {
      try {
        const res = await api.get('/class');
        if (res && res.success) {
          setClasses(res.data);
        }
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchDynamicClasses();
  }, []);
`;
            content = content.slice(0, endOfLine) + fetchLogic + content.slice(endOfLine);
        }
    }

    // Now, anywhere that creates dropdown options for classes, we must ensure it maps correctly
    // The previous mapping might be relying on c.name or c._id.
    // The Add Student page does:
    /*
    const selectedClass = classes.find(c => c.name === formData.className);
    if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0) {
      return selectedClass.sections.map(s => ({ label: s, value: s }));
    }
    return sections.map(s => ({ label: s.name, value: s.name }));
    */
    // We should simplify the sections logic.
    content = content.replace(
      /const selectedClass = classes\.find\(c => c\.name === (.*?)\);[\s\S]*?return sections\.map\(s => \(\{ label: s\.name, value: s\.name \}\)\);/m,
      `const selectedClass = classes.find(c => c.name === $1);
      if (selectedClass && selectedClass.sections && selectedClass.sections.length > 0) {
        return selectedClass.sections.map(s => ({ label: s, value: s }));
      }
      return [];`
    );

    // Some mapping for Class dropdown options uses c.name for both label and value, or c._id for value.
    // Let's ensure it's c.name for value as that's what the backend expects for Class Name string.
    content = content.replace(
      /options=\{classes\.map\(c => \(\{ label: c\.name, value: c\.(_id|name) \}\)\)\}/g,
      "options={classes.map(c => ({ label: c.name, value: c.name }))}"
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated dynamic classes in:', filePath);
  }
});
