import sys

with open('client/components/DashboardUI.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Students Card
old_student = '''{/* Students Card */}
          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">'''

new_student = '''{/* Students Card */}
          <div onClick={() => router.push('/dashboard/students')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'''

content = content.replace(old_student, new_student)

# Replace Attendance Card
old_att = '''{/* Attendance Card */}
          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">'''

new_att = '''{/* Attendance Card */}
          <div onClick={() => router.push('/dashboard/students/attendance')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'''

content = content.replace(old_att, new_att)

# Replace Fees Card
old_fees = '''{/* Fees Collection Card */}
          <div className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs">'''

new_fees = '''{/* Fees Collection Card */}
          <div onClick={() => router.push('/dashboard/fees/collection')} className="bg-white dark:bg-white/60 border border-zinc-300/80 dark:border-zinc-200/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-950/60 transition-colors shadow-xs cursor-pointer">'''

content = content.replace(old_fees, new_fees)

with open('client/components/DashboardUI.jsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
