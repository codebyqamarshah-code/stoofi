const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/admin/admission-query/page.js', 'utf8');

// 1. Replace default status 'Active' with 'Interested'
content = content.replace(/'Active'/g, "'Interested'");

// 2. Replace the options in the formData.status select
const formDataSelectRegex = /<select value=\{formData\.status\} onChange=\{e => setFormData\(\{\.\.\.formData, status: e\.target\.value\}\)\} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">\s*<option value="Interested">Interested<\/option>\s*<option value="Passive">Passive<\/option>\s*<option value="Dead">Dead<\/option>\s*<option value="Won">Won<\/option>\s*<option value="Lost">Lost<\/option>\s*<\/select>/g;

const newFormDataOptions = `<select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Follow-up Later">Follow-up Later</option>
                  <option value="Lost">Lost</option>
                  <option value="Invalid Query">Invalid Query</option>
                </select>`;

content = content.replace(formDataSelectRegex, newFormDataOptions);

// 3. Replace the options in the filters.status select
const filterSelectRegex = /<select value=\{filters\.status\} onChange=\{e => setFilters\(\{\.\.\.filters, status: e\.target\.value\}\)\} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">\s*<option value="">Select Status<\/option>\s*<option value="Interested">Interested<\/option>\s*<option value="Passive">Passive<\/option>\s*<option value="Dead">Dead<\/option>\s*<option value="Won">Won<\/option>\s*<option value="Lost">Lost<\/option>\s*<\/select>/g;

const newFilterOptions = `<select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 text-white">
                  <option value="">Select Status</option>
                  <option value="Interested">Interested</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Follow-up Later">Follow-up Later</option>
                  <option value="Lost">Lost</option>
                  <option value="Invalid Query">Invalid Query</option>
                </select>`;

content = content.replace(filterSelectRegex, newFilterOptions);

// 4. Update the styling logic for the status badge
// original badge logic might be: q.status === 'Interested' ? 'bg-zinc-600/10 ...' : q.status === 'Won' ...
// Let's replace the entire span className dynamically.
const oldBadgeRegex = /<span className=\{\`px-2 py-0\.5 rounded text-\[10px\] font-bold uppercase \$\{q\.status === 'Interested' \? 'bg-zinc-600\/10 text-zinc-600 border border-zinc-600\/20' : q\.status === 'Won' \? 'bg-zinc-600\/10 text-zinc-600 border border-zinc-600\/20' : 'bg-rose-500\/10 text-rose-500 border border-rose-500\/20'\}\`\}>/g;

const newBadgeStyle = `<span className={\`px-2 py-0.5 rounded text-[10px] font-bold uppercase \${q.status === 'Interested' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : q.status === 'Follow-up Later' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}\`}>`;

content = content.replace(oldBadgeRegex, newBadgeStyle);

fs.writeFileSync('client/app/dashboard/admin/admission-query/page.js', content);
console.log('UI updated for statuses.');
