const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/layout.js', 'utf8');

const stateCode = `
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);
  const [hasUnreadNotif, setHasUnreadNotif] = useState(false);

  useEffect(() => {
    if (user?.role === 'Super Admin' || user?.role === 'Admin') {
      const fetchLiveUpdates = async () => {
        try {
          const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/dashboard/live-updates', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          const result = await res.json();
          if (result.success) {
            setLiveNotifications(result.data.notifications);
            setActiveStudentsCount(result.data.activeStudents);
            if (result.data.notifications.length > 0) {
              setHasUnreadNotif(true);
            }
          }
        } catch (error) {
          console.error('Failed to fetch live updates', error);
        }
      };
      fetchLiveUpdates();
      const interval = setInterval(fetchLiveUpdates, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);
`;

content = content.replace(
  "const [openSubmenu, setOpenSubmenu] = useState(null);",
  "const [openSubmenu, setOpenSubmenu] = useState(null);\n" + stateCode
);

content = content.replace(
  `<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-950 text-[10px] font-bold text-white flex items-center justify-center">\n                    2\n                  </span>`,
  `{hasUnreadNotif && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {liveNotifications.length}
                  </span>
                )}`
);

content = content.replace(
  `<div className="text-[10px] text-zinc-950 cursor-pointer hover:underline">Mark all read</div>`,
  `<div onClick={() => setHasUnreadNotif(false)} className="text-[10px] text-zinc-950 cursor-pointer hover:underline">Mark all read</div>`
);

// We need to replace the static notification list
const notifHtml = `
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {liveNotifications.length > 0 ? liveNotifications.map(notif => (
                        <div key={notif._id} className="p-2 bg-zinc-100/50 dark:bg-zinc-100 rounded-md border border-zinc-300 dark:border-zinc-200 cursor-pointer hover:bg-zinc-200/50">
                          <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-800">{notif.title}</div>
                          <div className="text-[10px] text-zinc-950 dark:text-zinc-600">{notif.message}</div>
                          <div className="text-[8px] text-zinc-500 mt-1">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                        </div>
                      )) : (
                        <div className="p-4 text-center text-xs text-zinc-500">No new notifications</div>
                      )}
                    </div>
`;

// Find the old list block
const oldNotifHtmlPattern = /<div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">[\s\S]*?<\/div>\s*<\/div>\s*\)\}/;
content = content.replace(oldNotifHtmlPattern, notifHtml.trim() + '\n                  </div>\n                )}');

fs.writeFileSync('client/app/dashboard/layout.js', content);
