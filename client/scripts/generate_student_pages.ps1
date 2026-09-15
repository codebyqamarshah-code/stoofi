$pages = @(
  # LMS
  @{ path = "lms/course"; title = "Course List"; breadcrumb = "LMS', 'Course"; columns = "'SL', 'Course Name', 'Instructor', 'Price'"; showFilter = "$true" },
  @{ path = "lms/my-course"; title = "My Course"; breadcrumb = "LMS', 'My Course"; columns = "'Course Name', 'Instructor', 'Progress', 'Status'"; showFilter = "$false" },
  @{ path = "lms/purchase-history"; title = "Purchase History"; breadcrumb = "LMS', 'Purchase History"; columns = "'Course', 'Student', 'Paid Amount', 'Instructor', 'Payment Method', 'Purchase Date', 'Status'"; showFilter = "$false" },
  @{ path = "lms/my-quiz"; title = "My Quiz"; breadcrumb = "LMS', 'My Quiz"; columns = "'Quiz Name', 'Course', 'Score', 'Status'"; showFilter = "$false" },
  @{ path = "lms/my-certificates"; title = "My Certificates"; breadcrumb = "LMS', 'My Certificates"; columns = "'Certificate Name', 'Course', 'Date Issued', 'Action'"; showFilter = "$false" },
  
  # Lesson Plan
  @{ path = "lesson-plan/plan"; title = "Lesson Plan"; breadcrumb = "Lesson Plan', 'Lesson Plan"; columns = "'Subject', 'Topic', 'Date', 'Status'"; showFilter = "$true" },
  @{ path = "lesson-plan/overview"; title = "Lesson Plan Overview"; breadcrumb = "Lesson Plan', 'Overview"; columns = "'Subject', 'Completed Topics', 'Pending Topics', 'Progress'"; showFilter = "$true" },
  
  # Study Material
  @{ path = "study-material/assignment"; title = "Assignment List"; breadcrumb = "Study Material', 'Assignment"; columns = "'Title', 'Subject', 'Deadline', 'Status', 'Action'"; showFilter = "$true" },
  @{ path = "study-material/syllabus"; title = "Syllabus List"; breadcrumb = "Study Material', 'Syllabus"; columns = "'Class', 'Subject', 'Title', 'Action'"; showFilter = "$true" },
  @{ path = "study-material/others-download"; title = "Others Download"; breadcrumb = "Study Material', 'Others Download"; columns = "'Title', 'Description', 'Date', 'Action'"; showFilter = "$false" },
  
  # Leave
  @{ path = "leave/apply"; title = "Apply Leave"; breadcrumb = "Leave', 'Apply Leave"; columns = "'Leave Type', 'From', 'To', 'Reason', 'Status', 'Action'"; showFilter = "$false" },
  @{ path = "leave/pending"; title = "Pending Leave Request"; breadcrumb = "Leave', 'Pending Leave Request"; columns = "'Leave Type', 'Apply Date', 'Status'"; showFilter = "$false" },
  
  # Chat
  @{ path = "chat/chat-box"; isChat = $true },
  @{ path = "chat/invitation"; title = "Chat Invitations"; breadcrumb = "Chat', 'Invitation"; columns = "'User', 'Role', 'Status', 'Action'"; showFilter = "$false" },
  @{ path = "chat/blocked-user"; title = "Blocked Users"; breadcrumb = "Chat', 'Blocked User"; columns = "'User', 'Role', 'Date Blocked', 'Action'"; showFilter = "$false" },
  
  # Examinations
  @{ path = "examinations/result"; title = "Exam Results"; breadcrumb = "Examinations', 'Result"; columns = "'Exam', 'Subject', 'Marks Obtained', 'Grade'"; showFilter = "$true" },
  @{ path = "examinations/schedule"; title = "Exam Schedule"; breadcrumb = "Examinations', 'Exam Schedule"; columns = "'Exam Name', 'Subject', 'Date', 'Time', 'Room'"; showFilter = "$true" },
  
  # Online Exam
  @{ path = "online-exam/active"; title = "Active Online Exams"; breadcrumb = "Online Exam', 'Active Exams"; columns = "'Exam Title', 'Subject', 'Duration', 'End Date', 'Action'"; showFilter = "$true" },
  @{ path = "online-exam/view-result"; title = "Online Exam Results"; breadcrumb = "Online Exam', 'View Result"; columns = "'Exam Title', 'Score', 'Total Marks', 'Date Taken', 'Status'"; showFilter = "$true" },
  
  # Library
  @{ path = "library/book-list"; title = "Book List"; breadcrumb = "Library', 'Book List"; columns = "'Book No', 'Title', 'Author', 'Publisher', 'Availability'"; showFilter = "$false" },
  @{ path = "library/book-issue"; title = "Issued Books"; breadcrumb = "Library', 'Book Issue"; columns = "'Book Title', 'Issue Date', 'Return Date', 'Status'"; showFilter = "$false" },
  
  # Virtual Class
  @{ path = "virtual-class/virtual-class"; title = "Virtual Class List"; breadcrumb = "Virtual Class', 'Virtual Class"; columns = "'Topic', 'Teacher', 'Date', 'Time', 'Meeting Link'"; showFilter = "$true" }
)

$baseDir = "c:\Users\QAMAR SHAH\Desktop\stoofi\client\app\dashboard\student"

foreach ($page in $pages) {
  $dirPath = Join-Path $baseDir $page.path
  if (-not (Test-Path $dirPath)) {
    New-Item -ItemType Directory -Force -Path $dirPath | Out-Null
  }
  
  $filePath = Join-Path $dirPath "page.js"
  
  if ($page.isChat) {
    # Simple chat wrapper for the chat box
    $content = @"
'use client';
import ChatBox from '@/components/dashboard/chat/ChatBox';

export default function ChatBoxPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-140px)] border border-zinc-100 overflow-hidden">
      <ChatBox />
    </div>
  );
}
"@
  } else {
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
  }

  Set-Content -Path $filePath -Value $content
}

Write-Host "All pages generated successfully!"
