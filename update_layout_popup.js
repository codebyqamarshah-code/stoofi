const fs = require('fs');
let content = fs.readFileSync('client/app/dashboard/layout.js', 'utf8');

const popupStateStr = `
  const [showNoticePopup, setShowNoticePopup] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchNotices = async () => {
        try {
          const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/dashboard/notices', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            // Filter by audience
            const validNotices = result.data.filter(n => n.audience === 'All' || n.audience === user.role);
            if (validNotices.length > 0) {
              const notice = validNotices[0];
              // check if already seen this session
              const seen = sessionStorage.getItem('seenNotice_' + notice._id);
              if (!seen) {
                setLatestNotice(notice);
                setShowNoticePopup(true);
                sessionStorage.setItem('seenNotice_' + notice._id, 'true');
              }
            }
          }
        } catch(e) {}
      };
      fetchNotices();
    }
  }, [user]);
`;

content = content.replace(
  "const [hasUnreadNotif, setHasUnreadNotif] = useState(false);",
  "const [hasUnreadNotif, setHasUnreadNotif] = useState(false);\n" + popupStateStr
);

const modalStr = `
      {/* Notice Popup Modal */}
      {showNoticePopup && latestNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
              <h3 className="font-extrabold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                <Megaphone className="h-5 w-5" /> New Announcement
              </h3>
              <button onClick={() => setShowNoticePopup(false)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 rounded-full transition-colors text-emerald-700 dark:text-emerald-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">{latestNotice.title}</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{latestNotice.description}</p>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowNoticePopup(false)} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6">Got it</Button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "return (\n    <div",
  modalStr + "\n  return (\n    <div"
);

fs.writeFileSync('client/app/dashboard/layout.js', content);
