const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'app', 'dashboard');

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace Dashboard spans
  if (content.includes('<span>Dashboard</span>')) {
    content = content.replace(/<span>Dashboard<\/span>/g, '<Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>');
  }

  // 2. Replace section spans with links
  content = content.replace(/<span>Settings<\/span>/g, '<Link href="/dashboard/settings/general" className="hover:text-emerald-400 transition-colors">Settings</Link>');
  content = content.replace(/<span>Academics<\/span>/g, '<Link href="/dashboard/academics/class" className="hover:text-emerald-400 transition-colors">Academics</Link>');
  content = content.replace(/<span>Human Resource<\/span>/g, '<Link href="/dashboard/hr/staff-directory" className="hover:text-emerald-400 transition-colors">Human Resource</Link>');
  content = content.replace(/<span>Student Info<\/span>/g, '<Link href="/dashboard/students" className="hover:text-emerald-400 transition-colors">Student Info</Link>');
  content = content.replace(/<span>Fees<\/span>/g, '<Link href="/dashboard/fees/invoice" className="hover:text-emerald-400 transition-colors">Fees</Link>');
  content = content.replace(/<span>Examination<\/span>/g, '<Link href="/dashboard/examination/exam-setup" className="hover:text-emerald-400 transition-colors">Examination</Link>');
  content = content.replace(/<span>Leave<\/span>/g, '<Link href="/dashboard/leave/apply" className="hover:text-emerald-400 transition-colors">Leave</Link>');
  content = content.replace(/<span>Role & Permission<\/span>/g, '<Link href="/dashboard/roles/role" className="hover:text-emerald-400 transition-colors">Role & Permission</Link>');
  content = content.replace(/<span>Teacher Evaluation<\/span>/g, '<Link href="/dashboard/teacher-evaluation/approved-report" className="hover:text-emerald-400 transition-colors">Teacher Evaluation</Link>');
  content = content.replace(/<span>Behaviour Records<\/span>/g, '<Link href="/dashboard/behaviour/incidents" className="hover:text-emerald-400 transition-colors">Behaviour Records</Link>');
  content = content.replace(/<span>Admin Section<\/span>/g, '<Link href="/dashboard/admin/admission-query" className="hover:text-emerald-400 transition-colors">Admin Section</Link>');

  // 3. Ensure Link is imported if Link is used in file
  if (content.includes('<Link') && !content.includes("import Link from 'next/link'") && !content.includes('import Link from "next/link"')) {
    if (content.includes("'use client';")) {
      content = content.replace("'use client';", "'use client';\n\nimport Link from 'next/link';");
    } else if (content.includes('"use client";')) {
      content = content.replace('"use client";', '"use client";\n\nimport Link from "next/link";');
    } else {
      content = "import Link from 'next/link';\n" + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated breadcrumb links in: ${path.relative(targetDir, filePath)}`);
  }
}

console.log('Starting breadcrumb link updater...');
processDirectory(targetDir);
console.log('Finished updating breadcrumb links.');
