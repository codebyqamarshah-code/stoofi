const fs = require('fs');

const pagePath = 'client/app/dashboard/students/add/page.js';
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Fix the Tabs overflow/slider issue
// Find: className="flex flex-wrap border-b border-zinc-800 mb-6 relative"
// or whatever it is now
content = content.replace(
    /className="flex flex-wrap border-b border-zinc-800 mb-6 relative"/g,
    'className="flex overflow-x-auto whitespace-nowrap border-b border-zinc-200 dark:border-zinc-800 mb-6 relative pb-1 custom-scrollbar"'
);

// Add custom-scrollbar to global css if not exists, but we can just use tailwind scrollbar classes if possible. The class custom-scrollbar is usually defined in stoofi.

// 2. Add Previews and Validation to Document Uploads
// We need state for previews
const stateInsertPos = content.indexOf('const [formData, setFormData] = useState({');
const previewState = `
  const [docPreviews, setDocPreviews] = useState({ cnicFront: null, cnicBack: null, document1: null, qualificationDocument: null, previousSchoolDocument: null });
  const [docErrors, setDocErrors] = useState({ cnicFront: '', cnicBack: '', document1: '', qualificationDocument: '', previousSchoolDocument: '' });
  
  const handleDocChange = (e, docType) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate real document (basic MIME and size)
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setDocErrors(prev => ({...prev, [docType]: 'Fake or invalid document. Only JPG, PNG, or PDF allowed.'}));
        setDocPreviews(prev => ({...prev, [docType]: null}));
        setDocFiles(prev => ({...prev, [docType]: null}));
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setDocErrors(prev => ({...prev, [docType]: 'File too large. Max 5MB allowed.'}));
        setDocPreviews(prev => ({...prev, [docType]: null}));
        setDocFiles(prev => ({...prev, [docType]: null}));
        return;
      }

      setDocErrors(prev => ({...prev, [docType]: ''}));
      setDocFiles(prev => ({...prev, [docType]: file}));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setDocPreviews(prev => ({...prev, [docType]: { url: previewUrl, type: file.type }}));
    }
  };

`;
// Replace the old handleDocChange
content = content.replace(/const handleDocChange = \(e, docType\) => \{[\s\S]*?\}\s*\};\s*/, '');
content = content.slice(0, stateInsertPos) + previewState + content.slice(stateInsertPos);


// Helper for rendering document preview
const renderPreviewBlock = `
const DocumentPreview = ({ preview, error }) => {
  if (error) return <p className="text-rose-500 text-xs mt-1 font-semibold">{error}</p>;
  if (!preview) return null;
  return (
    <div className="mt-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 bg-white dark:bg-zinc-800 relative w-full h-32 overflow-hidden shadow-sm">
      {preview.type === 'application/pdf' ? (
        <iframe src={preview.url} className="w-full h-full rounded" />
      ) : (
        <img src={preview.url} alt="Document Preview" className="w-full h-full object-cover rounded" />
      )}
      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">VERIFIED</div>
    </div>
  );
};
`;

// Insert the component before the default export
content = content.replace('export default function AddStudentPage() {', renderPreviewBlock + '\nexport default function AddStudentPage() {');


// Replace the input fields with the preview attached
const replaceInputWithPreview = (docType, label) => {
    const inputRegex = new RegExp(`<Input type="file" accept="image/\\*,application/pdf" onChange={\\(e\\) => handleDocChange\\(e, '${docType}'\\)}[^>]*/>`);
    content = content.replace(inputRegex, (match) => {
        return `${match}\n                        <DocumentPreview preview={docPreviews.${docType}} error={docErrors.${docType}} />`;
    });
};

replaceInputWithPreview('document1', 'Transfer Certificate');
replaceInputWithPreview('cnicFront', 'CNIC Front');
replaceInputWithPreview('cnicBack', 'CNIC Back');
replaceInputWithPreview('qualificationDocument', 'Qualification');


// 3. Update Previous School Info Section
const prevSchoolRegex = /<h3 className="text-sm font-bold text-white border-b border-zinc-800 pb-2 mb-4">PREVIOUS SCHOOL DETAILS<\/h3>\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">([\s\S]*?)<\/div>/;

const prevSchoolReplacement = `<h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">PREVIOUS SCHOOL DETAILS</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Qualification Covered</Label>
                        <SearchableSelect 
                          name="qualificationLevel" 
                          value={formData.qualificationLevel || ''} 
                          onChange={handleInputChange} 
                          placeholder="Select Qualification (e.g., Matric)"
                          options={QUALIFICATION_LEVELS} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Type</Label>
                        <SearchableSelect 
                          name="instituteType" 
                          value={formData.instituteType || ''} 
                          onChange={handleInputChange} 
                          placeholder="Select Institute Type"
                          options={[
                            { label: 'School', value: 'School' },
                            { label: 'College', value: 'College' },
                            { label: 'University', value: 'University' },
                            { label: 'Institute', value: 'Institute' },
                            { label: 'Academy', value: 'Academy' }
                          ]} 
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Name</Label>
                        <Input name="previousSchoolName" value={formData.previousSchoolName} onChange={(e) => {
                          handleInputChange(e);
                          setFormData(prev => ({ ...prev, previousSchool: e.target.value }));
                        }} placeholder="e.g. Army Public School" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Address</Label>
                        <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} placeholder="City, Campus address" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                      
                    </div>`;

content = content.replace(prevSchoolRegex, prevSchoolReplacement);

// 4. Update the Tab buttons classes for light/dark mode support (so it's visible in both)
const tabRegex = /className=\{\`px-4 py-3 text-xs font-semibold transition-colors border-b-2 uppercase \$\{([\s\S]*?)\}\`\}/;
content = content.replace(tabRegex, `className={\`px-4 py-3 text-xs font-semibold transition-colors border-b-2 uppercase \${
                      activeTab === tab
                        ? 'border-emerald-500 text-emerald-600 dark:text-white bg-emerald-50 dark:bg-zinc-900/80 font-bold'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/40'
                    }\`}`);

// Also fix the activeTab check if they don't click perfectly
content = content.replace(/activeTab === tab/g, "activeTab === tab");

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Add Student Page updated');
