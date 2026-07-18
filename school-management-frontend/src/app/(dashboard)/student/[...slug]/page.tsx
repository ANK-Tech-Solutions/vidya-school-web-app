import { notFound } from "next/navigation";
import { AcademicModule } from "@/components/academic/academic-module";

const modules: Record<
  string,
  {
    title: string;
    description: string;
    endpoint: string;
    createEndpoint?: string;
    createLabel?: string;
    fields?: { name: string; label: string; type?: string; required?: boolean }[];
  }
> = {
  timetable: { title: "Timetable", description: "Your scheduled classes.", endpoint: "/api/v1/student/academic/timetable" },
  homework: { title: "Homework", description: "Assignments from your teachers.", endpoint: "/api/v1/student/academic/homework" },
  exams: { title: "Exams & results", description: "Upcoming exams and published results.", endpoint: "/api/v1/student/academic/exams" },
  results: { title: "Results", description: "Your published exam results.", endpoint: "/api/v1/student/academic/exam-results" },
  fees: { title: "Fees", description: "Your fee invoices and payment status.", endpoint: "/api/v1/student/academic/fees" },
  notices: { title: "Notice board", description: "School updates and announcements.", endpoint: "/api/v1/student/academic/notices" },
  leave: {
    title: "Leave requests",
    description: "Request time away and follow approvals.",
    endpoint: "/api/v1/student/academic/leaves",
    createEndpoint: "/api/v1/student/academic/leaves",
    createLabel: "Request leave",
    fields: [
      { name: "leaveType", label: "Leave type", required: true },
      { name: "fromDate", label: "From", type: "date", required: true },
      { name: "toDate", label: "To", type: "date", required: true },
      { name: "description", label: "Reason", type: "textarea", required: true },
    ],
  },
  calendar: { title: "Calendar", description: "School events and important dates.", endpoint: "/api/v1/student/academic/calendar" },
};

export default async function StudentAcademicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pageConfig = modules[slug[0]];
  if (!pageConfig || slug.length !== 1) notFound();
  return <AcademicModule {...pageConfig} />;
}
