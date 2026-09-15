$pages = @(
  @{ path = "subjects"; title = "Subjects List"; breadcrumb = "Subjects"; columns = "'Subject Name', 'Teacher', 'Classes'"; showFilter = "$false" },
  @{ path = "teachers"; title = "Teachers Directory"; breadcrumb = "Teachers"; columns = "'Teacher Name', 'Department', 'Phone', 'Email'"; showFilter = "$true" },
  @{ path = "homework"; title = "Pending Homework"; breadcrumb = "Homework"; columns = "'Subject', 'Topic', 'Deadline', 'Status'"; showFilter = "$true" },
  @{ path = "attendance"; title = "Attendance Record"; breadcrumb = "Attendance"; columns = "'Date', 'Status', 'Remarks'"; showFilter = "$true" },
  @{ path = "fees"; title = "Fees Invoice"; breadcrumb = "Fees', 'Fees Invoice"; columns = "'SL', 'Student', 'Class(Section)', 'Amount', 'Waiver', 'Fine', 'Paid', 'Balance', 'Status', 'Date'"; showFilter = "$true" }
)

$baseDir = "c:\Users\QAMAR SHAH\Desktop\stoofi\client\app\dashboard\student"

foreach ($page in $pages) {
  $dirPath = Join-Path $baseDir $page.path
  if (-not (Test-Path $dirPath)) {
    New-Item -ItemType Directory -Force -Path $dirPath | Out-Null
  }
  
  $filePath = Join-Path $dirPath "page.js"
  
  $content = @"
'use client';
import StudentDataTable from '@/components/student/StudentDataTable';

export default function Page() {
  return (
    <StudentDataTable 
      title="$($page.title)"
      breadcrumb={['$($page.breadcrumb)']}
      columns={[$($page.columns)]}
      showClassFilter={$($page.showFilter)}
      data={[]} 
    />
  );
}
"@

  Set-Content -Path $filePath -Value $content
}

Write-Host "Missing stat card pages generated!"
