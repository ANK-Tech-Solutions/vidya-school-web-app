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
  homework: {
    title: "Homework",
    description: "Assign and manage class homework.",
    endpoint: "/api/v1/teacher/homework",
    createEndpoint: "/api/v1/teacher/homework",
    createLabel: "Assign homework",
    fields: [
      { name: "grade", label: "Grade", required: true },
      { name: "section", label: "Section", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Instructions", type: "textarea" },
      { name: "dueDate", label: "Due date", type: "date" },
    ],
  },
  materials: {
    title: "Study material",
    description: "Upload learning resources for your classes.",
    endpoint: "/api/v1/teacher/study-materials",
    createEndpoint: "/api/v1/teacher/study-materials",
    createLabel: "Upload material",
    fields: [
      { name: "grade", label: "Grade", required: true },
      { name: "section", label: "Section", required: true },
      { name: "subject", label: "Subject", required: true },
      { name: "title", label: "Title", required: true },
      { name: "fileUrl", label: "File URL", required: true },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  timetable: { title: "Timetable", description: "School class schedule.", endpoint: "/api/v1/teacher/timetable" },
  students: { title: "Students", description: "Active students in your school.", endpoint: "/api/v1/teacher/students" },
  announcements: {
    title: "Announcements",
    description: "Send updates directly to students.",
    endpoint: "/api/v1/teacher/notices",
    createEndpoint: "/api/v1/teacher/announcements",
    createLabel: "Post announcement",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "description", label: "Message", type: "textarea", required: true },
      { name: "priority", label: "Priority" },
    ],
  },
  evaluate: {
    title: "Evaluate",
    description: "Exams available for result entry. Use student ID when posting marks from admin exams.",
    endpoint: "/api/v1/teacher/exams",
  },
  leave: {
    title: "Leave requests",
    description: "Request leave and track approvals.",
    endpoint: "/api/v1/teacher/leaves",
    createEndpoint: "/api/v1/teacher/leaves",
    createLabel: "Request leave",
    fields: [
      { name: "leaveType", label: "Leave type", required: true },
      { name: "fromDate", label: "From", type: "date", required: true },
      { name: "toDate", label: "To", type: "date", required: true },
      { name: "description", label: "Reason", type: "textarea", required: true },
    ],
  },
  notices: { title: "Notice board", description: "School-wide notices.", endpoint: "/api/v1/teacher/notices" },
  tracking: { title: "Live tracking", description: "Fleet availability snapshot.", endpoint: "/api/v1/teacher/live-tracking-stats" },
  profile: { title: "Profile", description: "Your teaching account.", endpoint: "/api/v1/teacher/dashboard" },
};

export default async function TeacherAcademicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const module = modules[slug[0]];
  if (!module || slug.length !== 1) notFound();
  return <AcademicModule {...module} />;
}
