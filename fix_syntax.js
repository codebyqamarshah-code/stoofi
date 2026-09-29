const fs = require('fs');

const pagePath = 'client/app/dashboard/students/add/page.js';
let content = fs.readFileSync(pagePath, 'utf8');

const faultyBlockRegex = /<div className="space-y-1\.5">\s*<Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Address<\/Label>[\s\S]*?<\/div>\s*<\/div>\s*<div className="space-y-1\.5">\s*<Label className="text-xs font-semibold text-zinc-400 uppercase">Previous School Address<\/Label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const fixedBlock = `<div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Institute Address</Label>
                        <Input name="previousSchoolAddress" value={formData.previousSchoolAddress} onChange={handleInputChange} placeholder="City, Campus address" className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 focus-visible:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}`;

content = content.replace(faultyBlockRegex, fixedBlock);
fs.writeFileSync(pagePath, content, 'utf8');
console.log('Fixed JSX syntax error in page.js');
