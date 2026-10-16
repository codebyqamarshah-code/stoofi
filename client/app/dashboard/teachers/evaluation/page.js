import { redirect } from 'next/navigation';

export default function TeacherEvaluationRedirect() {
  redirect('/dashboard/teacher-evaluation/teacher-wise-report');
}
