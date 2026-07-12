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
  timetable: {
    title: "Timetable",
    description: "Build the school class timetable.",
    endpoint: "/api/v1/admin/timetable",
    createEndpoint: "/api/v1/admin/timetable",
    createLabel: "Add slot",
    fields: [
      { name: "grade", label: "Grade", required: true },
      { name: "section", label: "Section", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "dayOfWeek", label: "Day (1-7)", type: "number", required: true },
      { name: "periodNo", label: "Period", type: "number", required: true },
      { name: "startTime", label: "Start (HH:MM:SS)", required: true },
      { name: "endTime", label: "End (HH:MM:SS)", required: true },
      { name: "room", label: "Room" },
    ],
  },
  attendance: { title: "Attendance reports", description: "Review recorded classroom attendance.", endpoint: "/api/v1/admin/class-attendance" },
  fees: {
    title: "Fees",
    description: "Manage student fee invoices.",
    endpoint: "/api/v1/admin/fees",
    createEndpoint: "/api/v1/admin/fees",
    createLabel: "Create invoice",
    fields: [
      { name: "studentId", label: "Student ID", type: "number", required: true },
      { name: "title", label: "Fee title", required: true },
      { name: "amount", label: "Amount", type: "number", required: true },
      { name: "dueDate", label: "Due date", type: "date" },
    ],
  },
  salaries: {
    title: "Salaries",
    description: "Track staff salary records.",
    endpoint: "/api/v1/admin/salaries",
    createEndpoint: "/api/v1/admin/salaries",
    createLabel: "Add salary",
    fields: [
      { name: "teacherId", label: "Teacher ID", type: "number", required: true },
      { name: "monthLabel", label: "Month (YYYY-MM)", required: true },
      { name: "grossAmount", label: "Gross", type: "number", required: true },
      { name: "deductions", label: "Deductions", type: "number" },
      { name: "netAmount", label: "Net", type: "number", required: true },
    ],
  },
  exams: {
    title: "Exams",
    description: "Plan exams and publish results.",
    endpoint: "/api/v1/admin/exams",
    createEndpoint: "/api/v1/admin/exams",
    createLabel: "Create exam",
    fields: [
      { name: "name", label: "Exam name", required: true },
      { name: "grade", label: "Grade", required: true },
      { name: "section", label: "Section" },
      { name: "subject", label: "Subject", required: true },
      { name: "date", label: "Exam date", type: "date", required: true },
      { name: "maxMarks", label: "Max marks", type: "number" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  notices: {
    title: "Notice board",
    description: "Publish important school communications.",
    endpoint: "/api/v1/admin/notices",
    createEndpoint: "/api/v1/admin/notices",
    createLabel: "Create notice",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Message", type: "textarea", required: true },
      { name: "audience", label: "Audience (ALL/STUDENTS/TEACHERS/PARENTS)" },
      { name: "priority", label: "Priority (NORMAL/HIGH/URGENT)" },
    ],
  },
  calendar: {
    title: "Calendar",
    description: "Plan school events and dates.",
    endpoint: "/api/v1/admin/calendar",
    createEndpoint: "/api/v1/admin/calendar",
    createLabel: "Add event",
    fields: [
      { name: "title", label: "Event title", required: true },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "eventType", label: "Type" },
    ],
  },
};

export default async function AdminAcademicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug[0] === "leaves") notFound();
  const pageConfig = modules[slug[0]];
  if (!pageConfig || slug.length !== 1) notFound();
  return <AcademicModule {...pageConfig} />;
}
