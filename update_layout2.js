const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/layout.js', 'utf8');

content = content.replace(
  `<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-950 text-[10px] font-bold text-white flex items-center justify-center">
                    2
                  </span>`,
  `{hasUnreadNotif && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {liveNotifications.length}
                  </span>
                )}`
);

content = content.replace(
  `<span className="text-[10px] text-zinc-950 cursor-pointer hover:underline">Mark all read</span>`,
  `<span onClick={() => setHasUnreadNotif(false)} className="text-[10px] text-zinc-950 cursor-pointer hover:underline">Mark all read</span>`
);

fs.writeFileSync('client/app/dashboard/layout.js', content);
