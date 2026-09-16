const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/layout.js', 'utf8');

const pillStr = `
            {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full cursor-default" title="Active Students (Logged in last 10 mins)">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-800">{activeStudentsCount} Active</span>
              </div>
            )}
            <ThemeToggle />
`;

content = content.replace("<ThemeToggle />", pillStr);

fs.writeFileSync('client/app/dashboard/layout.js', content);
