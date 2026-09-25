import re

with open('client/app/dashboard/layout.js', 'r', encoding='utf-8') as f:
    content = f.read()

use_effect = """
  // Auto-expand the active submenu on load and when pathname changes
  useEffect(() => {
    if (menuStructure && pathname) {
      let activeGroupName = null;
      for (const group of menuStructure) {
        if (group.items) {
          for (const item of group.items) {
            if (item.hasSubmenu && item.subItems) {
              const isActive = item.subItems.some(sub => pathname === sub.href);
              if (isActive) {
                activeGroupName = item.name;
                break;
              }
            } else {
              const targetHref = item.href || '/dashboard';
              if (pathname === targetHref) {
                activeGroupName = null; 
                break;
              }
            }
          }
        }
        if (activeGroupName) break;
      }
      
      if (activeGroupName && openSubmenu !== activeGroupName) {
        setOpenSubmenu(activeGroupName);
      }
    }
  }, [pathname, menuStructure]);
"""

if 'const [openSubmenu, setOpenSubmenu] = useState(null);' in content and 'Auto-expand the active submenu' not in content:
    content = content.replace('const [openSubmenu, setOpenSubmenu] = useState(null);', 'const [openSubmenu, setOpenSubmenu] = useState(null);\n' + use_effect)

content = content.replace(
    """? 'text-zinc-800 dark:text-zinc-900 bg-zinc-200/70 dark:bg-zinc-100 font-bold border border-zinc-300/80 dark:border-zinc-200'""",
    """? 'text-emerald-800 dark:text-emerald-900 bg-emerald-100 dark:bg-emerald-100 font-bold border border-emerald-300 dark:border-emerald-300'"""
)

content = content.replace(
    """""",
    """"""
)

with open('client/app/dashboard/layout.js', 'w', encoding='utf-8') as f:
    f.write(content)
