package com.schoolbus.controller;

import com.schoolbus.dto.request.AcademicRequest;
import com.schoolbus.dto.response.ApiResponse;
import com.schoolbus.entity.*;
import com.schoolbus.exception.ResourceNotFoundException;
import com.schoolbus.service.StudentAccessService;
import com.schoolbus.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AcademicController {
    @PersistenceContext
    private EntityManager em;
    private final StudentAccessService studentAccess;

    public AcademicController(StudentAccessService studentAccess) {
        this.studentAccess = studentAccess;
    }

    private Long sid() {
        return SecurityUtils.getCurrentSchoolId();
    }

    private School school() {
        return em.getReference(School.class, sid());
    }

    private Teacher teacher() {
        return em.createQuery("select t from Teacher t join fetch t.user where t.user.id=:u and t.school.id=:s", Teacher.class)
                .setParameter("u", SecurityUtils.getCurrentUserIdOptional().orElseThrow())
                .setParameter("s", sid())
                .getResultStream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    private Student student(Long studentId) {
        return studentAccess.getPrimaryStudent(studentId);
    }

    private Map<String, Object> map() {
        return new LinkedHashMap<>();
    }

    private Map<String, Object> notice(NoticeBoard n) {
        Map<String, Object> m = map();
        m.put("id", n.getId());
        m.put("title", n.getTitle());
        m.put("body", n.getBody());
        m.put("audience", n.getAudience());
        m.put("priority", n.getPriority());
        m.put("publishedAt", n.getPublishedAt());
        m.put("active", n.getActive());
        return m;
    }

    private Map<String, Object> slot(TimetableSlot t) {
        Map<String, Object> m = map();
        m.put("id", t.getId());
        m.put("title", t.getSubject() + " · Period " + t.getPeriodNo());
        m.put("grade", t.getGrade());
        m.put("section", t.getSection());
        m.put("dayOfWeek", t.getDayOfWeek());
        m.put("periodNo", t.getPeriodNo());
        m.put("subject", t.getSubject());
        m.put("startTime", t.getStartTime() == null ? null : t.getStartTime().toString());
        m.put("endTime", t.getEndTime() == null ? null : t.getEndTime().toString());
        m.put("room", t.getRoom());
        m.put("teacherId", t.getTeacher() == null ? null : t.getTeacher().getId());
        m.put("active", t.getActive());
        return m;
    }

    private Map<String, Object> fee(FeeInvoice f) {
        Map<String, Object> m = map();
        m.put("id", f.getId());
        m.put("title", f.getTitle());
        m.put("studentId", f.getStudent().getId());
        m.put("studentName", f.getStudent().getFullName());
        m.put("amount", f.getAmount());
        m.put("paidAmount", f.getPaidAmount());
        m.put("dueDate", f.getDueDate());
        m.put("status", f.getStatus());
        m.put("notes", f.getNotes());
        return m;
    }

    private Map<String, Object> salary(SalaryRecord s) {
        Map<String, Object> m = map();
        m.put("id", s.getId());
        m.put("title", s.getMonthLabel());
        m.put("teacherId", s.getTeacher().getId());
        m.put("teacherName", s.getTeacher().getUser().getFullName());
        m.put("monthLabel", s.getMonthLabel());
        m.put("grossAmount", s.getGrossAmount());
        m.put("deductions", s.getDeductions());
        m.put("netAmount", s.getNetAmount());
        m.put("status", s.getStatus());
        m.put("paidOn", s.getPaidOn());
        return m;
    }

    private Map<String, Object> exam(Exam e) {
        Map<String, Object> m = map();
        m.put("id", e.getId());
        m.put("title", e.getName());
        m.put("name", e.getName());
        m.put("examType", e.getExamType());
        m.put("grade", e.getGrade());
        m.put("section", e.getSection());
        m.put("subject", e.getSubject());
        m.put("examDate", e.getExamDate());
        m.put("maxMarks", e.getMaxMarks());
        m.put("description", e.getDescription());
        m.put("active", e.getActive());
        return m;
    }

    private Map<String, Object> leave(LeaveRequest l) {
        Map<String, Object> m = map();
        m.put("id", l.getId());
        m.put("title", l.getLeaveType() + " · " + l.getStatus());
        m.put("requesterRole", l.getRequesterRole());
        m.put("leaveType", l.getLeaveType());
        m.put("fromDate", l.getFromDate());
        m.put("toDate", l.getToDate());
        m.put("reason", l.getReason());
        m.put("status", l.getStatus());
        m.put("adminRemark", l.getAdminRemark());
        m.put("studentId", l.getStudent() == null ? null : l.getStudent().getId());
        m.put("studentName", l.getStudent() == null ? null : l.getStudent().getFullName());
        m.put("teacherId", l.getTeacher() == null ? null : l.getTeacher().getId());
        return m;
    }

    private Map<String, Object> calendar(CalendarEvent c) {
        Map<String, Object> m = map();
        m.put("id", c.getId());
        m.put("title", c.getTitle());
        m.put("description", c.getDescription());
        m.put("eventDate", c.getEventDate());
        m.put("endDate", c.getEndDate());
        m.put("eventType", c.getEventType());
        m.put("audience", c.getAudience());
        m.put("active", c.getActive());
        return m;
    }

    private Map<String, Object> attendance(ClassAttendance a) {
        Map<String, Object> m = map();
        m.put("id", a.getId());
        m.put("title", a.getStudent().getFullName() + " · " + a.getStatus());
        m.put("studentId", a.getStudent().getId());
        m.put("studentName", a.getStudent().getFullName());
        m.put("attendanceDate", a.getAttendanceDate());
        m.put("status", a.getStatus());
        m.put("remarks", a.getRemarks());
        return m;
    }

    private Map<String, Object> homework(Homework h) {
        Map<String, Object> m = map();
        m.put("id", h.getId());
        m.put("title", h.getTitle());
        m.put("grade", h.getGrade());
        m.put("section", h.getSection());
        m.put("subject", h.getSubject());
        m.put("description", h.getDescription());
        m.put("dueDate", h.getDueDate());
        m.put("attachmentUrl", h.getAttachmentUrl());
        m.put("teacherId", h.getTeacher().getId());
        return m;
    }

    private Map<String, Object> material(StudyMaterial x) {
        Map<String, Object> m = map();
        m.put("id", x.getId());
        m.put("title", x.getTitle());
        m.put("grade", x.getGrade());
        m.put("section", x.getSection());
        m.put("subject", x.getSubject());
        m.put("description", x.getDescription());
        m.put("fileUrl", x.getFileUrl());
        return m;
    }

    private Map<String, Object> result(ExamResult r) {
        Map<String, Object> m = map();
        m.put("id", r.getId());
        m.put("title", r.getExam().getName() + " · " + r.getMarksObtained());
        m.put("examId", r.getExam().getId());
        m.put("examName", r.getExam().getName());
        m.put("studentId", r.getStudent().getId());
        m.put("studentName", r.getStudent().getFullName());
        m.put("marksObtained", r.getMarksObtained());
        m.put("gradeLetter", r.getGradeLetter());
        m.put("remarks", r.getRemarks());
        return m;
    }

    private Map<String, Object> studentCard(Student s) {
        Map<String, Object> m = map();
        m.put("id", s.getId());
        m.put("title", s.getFullName());
        m.put("studentCode", s.getStudentCode());
        m.put("firstName", s.getFirstName());
        m.put("lastName", s.getLastName());
        m.put("grade", s.getGrade());
        m.put("section", s.getSection());
        m.put("active", s.getActive());
        return m;
    }

    @GetMapping("/api/v1/admin/notices")
    @Transactional(readOnly = true)
    public ApiResponse<?> notices() {
        return ApiResponse.success(em.createQuery("select n from NoticeBoard n where n.school.id=:s order by n.publishedAt desc", NoticeBoard.class)
                .setParameter("s", sid()).getResultList().stream().map(this::notice).toList());
    }

    @PostMapping("/api/v1/admin/notices")
    @Transactional
    public ApiResponse<?> createNotice(@RequestBody AcademicRequest r) {
        NoticeBoard n = NoticeBoard.builder().school(school()).title(r.title()).body(r.body())
                .audience(r.audience() == null ? "ALL" : r.audience())
                .priority(r.priority() == null ? "NORMAL" : r.priority())
                .createdByUserId(SecurityUtils.getCurrentUserIdOptional().orElse(null)).build();
        em.persist(n);
        return ApiResponse.success(notice(n));
    }

    @PutMapping("/api/v1/admin/notices/{id}")
    @Transactional
    public ApiResponse<?> updateNotice(@PathVariable Long id, @RequestBody AcademicRequest r) {
        NoticeBoard n = em.find(NoticeBoard.class, id);
        if (n == null || !n.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Notice not found");
        n.setTitle(r.title());
        n.setBody(r.body());
        if (r.audience() != null) n.setAudience(r.audience());
        if (r.priority() != null) n.setPriority(r.priority());
        return ApiResponse.success(notice(n));
    }

    @PatchMapping("/api/v1/admin/notices/{id}/publish")
    @Transactional
    public ApiResponse<?> publish(@PathVariable Long id) {
        NoticeBoard n = em.find(NoticeBoard.class, id);
        if (n == null || !n.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Notice not found");
        n.setPublishedAt(java.time.Instant.now());
        n.setActive(true);
        return ApiResponse.success(notice(n));
    }

    @DeleteMapping("/api/v1/admin/notices/{id}")
    @Transactional
    public ApiResponse<Void> deleteNotice(@PathVariable Long id) {
        NoticeBoard n = em.find(NoticeBoard.class, id);
        if (n == null || !n.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Notice not found");
        n.setActive(false);
        return ApiResponse.success("Notice removed", null);
    }

    @GetMapping("/api/v1/admin/timetable")
    @Transactional(readOnly = true)
    public ApiResponse<?> adminTimetable() {
        return ApiResponse.success(em.createQuery("select t from TimetableSlot t where t.school.id=:s and t.active=true order by t.dayOfWeek,t.periodNo", TimetableSlot.class)
                .setParameter("s", sid()).getResultList().stream().map(this::slot).toList());
    }

    @PostMapping("/api/v1/admin/timetable")
    @Transactional
    public ApiResponse<?> timetable(@RequestBody AcademicRequest r) {
        TimetableSlot t = TimetableSlot.builder().school(school()).grade(r.grade()).section(r.section()).subject(r.subject())
                .dayOfWeek(r.dayOfWeek()).periodNo(r.periodNo()).startTime(r.startTime()).endTime(r.endTime()).room(r.room())
                .teacher(r.teacherId() == null ? null : em.getReference(Teacher.class, r.teacherId())).build();
        em.persist(t);
        return ApiResponse.success(slot(t));
    }

    @PutMapping("/api/v1/admin/timetable/{id}")
    @Transactional
    public ApiResponse<?> updateTimetable(@PathVariable Long id, @RequestBody AcademicRequest r) {
        TimetableSlot t = em.find(TimetableSlot.class, id);
        if (t == null || !t.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Timetable slot not found");
        if (r.subject() != null) t.setSubject(r.subject());
        if (r.startTime() != null) t.setStartTime(r.startTime());
        if (r.endTime() != null) t.setEndTime(r.endTime());
        if (r.room() != null) t.setRoom(r.room());
        if (r.teacherId() != null) t.setTeacher(em.getReference(Teacher.class, r.teacherId()));
        return ApiResponse.success(slot(t));
    }

    @DeleteMapping("/api/v1/admin/timetable/{id}")
    @Transactional
    public ApiResponse<Void> deleteTimetable(@PathVariable Long id) {
        TimetableSlot t = em.find(TimetableSlot.class, id);
        if (t == null || !t.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Timetable slot not found");
        t.setActive(false);
        return ApiResponse.success("Timetable slot removed", null);
    }

    @GetMapping("/api/v1/admin/fees")
    @Transactional(readOnly = true)
    public ApiResponse<?> fees() {
        return ApiResponse.success(em.createQuery("select f from FeeInvoice f join fetch f.student where f.school.id=:s order by f.dueDate desc", FeeInvoice.class)
                .setParameter("s", sid()).getResultList().stream().map(this::fee).toList());
    }

    @PostMapping("/api/v1/admin/fees")
    @Transactional
    public ApiResponse<?> fee(@RequestBody AcademicRequest r) {
        FeeInvoice f = FeeInvoice.builder().school(school()).student(em.getReference(Student.class, r.studentId()))
                .title(r.title()).amount(r.amount()).paidAmount(BigDecimal.ZERO).dueDate(r.dueDate()).status("DUE").notes(r.description()).build();
        em.persist(f);
        return ApiResponse.success(fee(f));
    }

    @PatchMapping("/api/v1/admin/fees/{id}/paid")
    @Transactional
    public ApiResponse<?> paid(@PathVariable Long id, @RequestBody AcademicRequest r) {
        FeeInvoice f = em.find(FeeInvoice.class, id);
        if (f == null || !f.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Invoice not found");
        f.setPaidAmount(r.paidAmount() == null ? f.getAmount() : r.paidAmount());
        f.setStatus(f.getPaidAmount().compareTo(f.getAmount()) >= 0 ? "PAID" : "PARTIAL");
        return ApiResponse.success(fee(f));
    }

    @PutMapping("/api/v1/admin/fees/{id}")
    @Transactional
    public ApiResponse<?> updateFee(@PathVariable Long id, @RequestBody AcademicRequest r) {
        FeeInvoice f = em.find(FeeInvoice.class, id);
        if (f == null || !f.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Invoice not found");
        if (r.title() != null) f.setTitle(r.title());
        if (r.amount() != null) f.setAmount(r.amount());
        if (r.dueDate() != null) f.setDueDate(r.dueDate());
        return ApiResponse.success(fee(f));
    }

    @GetMapping("/api/v1/admin/salaries")
    @Transactional(readOnly = true)
    public ApiResponse<?> salaries() {
        return ApiResponse.success(em.createQuery("select s from SalaryRecord s join fetch s.teacher t join fetch t.user where s.school.id=:x order by s.monthLabel desc", SalaryRecord.class)
                .setParameter("x", sid()).getResultList().stream().map(this::salary).toList());
    }

    @PostMapping("/api/v1/admin/salaries")
    @Transactional
    public ApiResponse<?> salary(@RequestBody AcademicRequest r) {
        BigDecimal deductions = r.deductions() == null ? BigDecimal.ZERO : r.deductions();
        BigDecimal net = r.netAmount() != null ? r.netAmount() : r.grossAmount().subtract(deductions);
        SalaryRecord s = SalaryRecord.builder().school(school()).teacher(em.getReference(Teacher.class, r.teacherId()))
                .monthLabel(r.monthLabel()).grossAmount(r.grossAmount()).deductions(deductions).netAmount(net)
                .status(r.status() == null ? "PENDING" : r.status()).build();
        em.persist(s);
        return ApiResponse.success(salary(s));
    }

    @PutMapping("/api/v1/admin/salaries/{id}")
    @Transactional
    public ApiResponse<?> updateSalary(@PathVariable Long id, @RequestBody AcademicRequest r) {
        SalaryRecord s = em.find(SalaryRecord.class, id);
        if (s == null || !s.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Salary not found");
        if (r.status() != null) s.setStatus(r.status());
        if (r.netAmount() != null) s.setNetAmount(r.netAmount());
        if ("PAID".equalsIgnoreCase(s.getStatus())) s.setPaidOn(LocalDate.now());
        return ApiResponse.success(salary(s));
    }

    @GetMapping("/api/v1/admin/exams")
    @Transactional(readOnly = true)
    public ApiResponse<?> exams() {
        return ApiResponse.success(em.createQuery("select e from Exam e where e.school.id=:s and e.active=true order by e.examDate desc", Exam.class)
                .setParameter("s", sid()).getResultList().stream().map(this::exam).toList());
    }

    @PostMapping("/api/v1/admin/exams")
    @Transactional
    public ApiResponse<?> exam(@RequestBody AcademicRequest r) {
        Exam e = Exam.builder().school(school()).name(r.name()).examType(r.examType() == null ? "UNIT" : r.examType())
                .grade(r.grade()).section(r.section()).subject(r.subject()).examDate(r.date())
                .maxMarks(r.maxMarks() == null ? BigDecimal.valueOf(100) : r.maxMarks()).description(r.description()).build();
        em.persist(e);
        return ApiResponse.success(exam(e));
    }

    @PutMapping("/api/v1/admin/exams/{id}")
    @Transactional
    public ApiResponse<?> updateExam(@PathVariable Long id, @RequestBody AcademicRequest r) {
        Exam e = em.find(Exam.class, id);
        if (e == null || !e.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Exam not found");
        if (r.name() != null) e.setName(r.name());
        if (r.date() != null) e.setExamDate(r.date());
        if (r.description() != null) e.setDescription(r.description());
        return ApiResponse.success(exam(e));
    }

    @PutMapping("/api/v1/admin/exams/{examId}/results/{studentId}")
    @Transactional
    public ApiResponse<?> result(@PathVariable Long examId, @PathVariable Long studentId, @RequestBody AcademicRequest r) {
        ExamResult x = em.createQuery("select x from ExamResult x where x.exam.id=:e and x.student.id=:s", ExamResult.class)
                .setParameter("e", examId).setParameter("s", studentId).getResultStream().findFirst()
                .orElseGet(() -> ExamResult.builder().school(school()).exam(em.getReference(Exam.class, examId))
                        .student(em.getReference(Student.class, studentId)).build());
        x.setMarksObtained(r.marksObtained());
        x.setGradeLetter(r.gradeLetter());
        x.setRemarks(r.remarks());
        if (x.getId() == null) em.persist(x);
        return ApiResponse.success(result(x));
    }

    @GetMapping("/api/v1/admin/leaves")
    @Transactional(readOnly = true)
    public ApiResponse<?> leaves() {
        return ApiResponse.success(em.createQuery("select l from LeaveRequest l left join fetch l.student left join fetch l.teacher where l.school.id=:s order by l.createdAt desc", LeaveRequest.class)
                .setParameter("s", sid()).getResultList().stream().map(this::leave).toList());
    }

    @PatchMapping("/api/v1/admin/leaves/{id}/{decision}")
    @Transactional
    public ApiResponse<?> reviewLeave(@PathVariable Long id, @PathVariable String decision, @RequestBody(required = false) AcademicRequest r) {
        LeaveRequest l = em.find(LeaveRequest.class, id);
        if (l == null || !l.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Leave request not found");
        String status = decision.toUpperCase();
        if (!List.of("APPROVED", "REJECTED", "CANCELLED").contains(status)) status = "APPROVED";
        l.setStatus(status);
        l.setAdminRemark(r == null ? null : r.remarks());
        l.setReviewedByUserId(SecurityUtils.getCurrentUserIdOptional().orElse(null));
        return ApiResponse.success(leave(l));
    }

    @GetMapping("/api/v1/admin/calendar")
    @Transactional(readOnly = true)
    public ApiResponse<?> calendar() {
        return ApiResponse.success(em.createQuery("select c from CalendarEvent c where c.school.id=:s and c.active=true order by c.eventDate", CalendarEvent.class)
                .setParameter("s", sid()).getResultList().stream().map(this::calendar).toList());
    }

    @PostMapping("/api/v1/admin/calendar")
    @Transactional
    public ApiResponse<?> calendarCreate(@RequestBody AcademicRequest r) {
        CalendarEvent c = CalendarEvent.builder().school(school()).title(r.title()).description(r.description())
                .eventDate(r.date()).endDate(r.endDate()).eventType(r.eventType() == null ? "GENERAL" : r.eventType())
                .audience(r.audience() == null ? "ALL" : r.audience()).build();
        em.persist(c);
        return ApiResponse.success(calendar(c));
    }

    @PutMapping("/api/v1/admin/calendar/{id}")
    @Transactional
    public ApiResponse<?> calendarUpdate(@PathVariable Long id, @RequestBody AcademicRequest r) {
        CalendarEvent c = em.find(CalendarEvent.class, id);
        if (c == null || !c.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Event not found");
        if (r.title() != null) c.setTitle(r.title());
        if (r.date() != null) c.setEventDate(r.date());
        if (r.description() != null) c.setDescription(r.description());
        return ApiResponse.success(calendar(c));
    }

    @DeleteMapping("/api/v1/admin/calendar/{id}")
    @Transactional
    public ApiResponse<Void> calendarDelete(@PathVariable Long id) {
        CalendarEvent c = em.find(CalendarEvent.class, id);
        if (c == null || !c.getSchool().getId().equals(sid())) throw new ResourceNotFoundException("Event not found");
        c.setActive(false);
        return ApiResponse.success("Calendar event removed", null);
    }

    @GetMapping("/api/v1/admin/class-attendance")
    @Transactional(readOnly = true)
    public ApiResponse<?> attendanceReport() {
        return ApiResponse.success(em.createQuery("select a from ClassAttendance a join fetch a.student where a.school.id=:s order by a.attendanceDate desc", ClassAttendance.class)
                .setParameter("s", sid()).getResultList().stream().map(this::attendance).toList());
    }

    @GetMapping("/api/v1/teacher/dashboard")
    @Transactional(readOnly = true)
    public ApiResponse<?> dashboard() {
        Teacher t = teacher();
        Map<String, Object> m = new HashMap<>();
        m.put("teacherId", t.getId());
        m.put("name", t.getUser().getFullName());
        m.put("department", t.getDepartment());
        m.put("subjects", t.getSubjects());
        m.put("students", em.createQuery("select count(s) from Student s where s.school.id=:s and s.active=true", Long.class).setParameter("s", sid()).getSingleResult());
        m.put("pendingHomework", em.createQuery("select count(h) from Homework h where h.teacher.id=:t and h.active=true", Long.class).setParameter("t", t.getId()).getSingleResult());
        m.put("date", LocalDate.now().toString());
        return ApiResponse.success(m);
    }

    @PostMapping("/api/v1/teacher/class-attendance")
    @Transactional
    public ApiResponse<?> mark(@RequestBody AcademicRequest r) {
        Teacher t = teacher();
        LocalDate date = r.date() == null ? LocalDate.now() : r.date();
        for (var a : Optional.ofNullable(r.attendance()).orElse(List.of())) {
            ClassAttendance x = em.createQuery("select x from ClassAttendance x where x.student.id=:s and x.attendanceDate=:d", ClassAttendance.class)
                    .setParameter("s", a.studentId()).setParameter("d", date).getResultStream().findFirst()
                    .orElseGet(() -> ClassAttendance.builder().school(school()).student(em.getReference(Student.class, a.studentId()))
                            .teacher(t).attendanceDate(date).build());
            x.setStatus(a.status());
            x.setRemarks(a.remarks());
            if (x.getId() == null) em.persist(x);
        }
        return ApiResponse.success(Map.of("marked", r.attendance() == null ? 0 : r.attendance().size()));
    }

    @GetMapping("/api/v1/teacher/students")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherStudents(@RequestParam(required = false) String grade, @RequestParam(required = false) String section) {
        var q = em.createQuery("select s from Student s where s.school.id=:x and s.active=true"
                + (grade == null || grade.isBlank() ? "" : " and s.grade=:g")
                + (section == null || section.isBlank() ? "" : " and s.section=:q")
                + " order by s.firstName", Student.class).setParameter("x", sid());
        if (grade != null && !grade.isBlank()) q.setParameter("g", grade);
        if (section != null && !section.isBlank()) q.setParameter("q", section);
        return ApiResponse.success(q.getResultList().stream().map(this::studentCard).toList());
    }

    @PostMapping("/api/v1/teacher/announcements")
    @Transactional
    public ApiResponse<?> announcement(@RequestBody AcademicRequest r) {
        NoticeBoard n = NoticeBoard.builder().school(school()).title(r.title()).body(r.body()).audience("STUDENTS")
                .priority(r.priority() == null ? "NORMAL" : r.priority())
                .createdByUserId(SecurityUtils.getCurrentUserIdOptional().orElse(null)).build();
        em.persist(n);
        return ApiResponse.success(notice(n));
    }

    @GetMapping("/api/v1/teacher/timetable")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherTimetable() {
        return adminTimetable();
    }

    @GetMapping("/api/v1/teacher/homework")
    @Transactional(readOnly = true)
    public ApiResponse<?> homework() {
        return ApiResponse.success(em.createQuery("select h from Homework h where h.teacher.id=:t and h.active=true order by h.dueDate desc", Homework.class)
                .setParameter("t", teacher().getId()).getResultList().stream().map(this::homework).toList());
    }

    @PostMapping("/api/v1/teacher/homework")
    @Transactional
    public ApiResponse<?> homeworkCreate(@RequestBody AcademicRequest r) {
        Homework h = Homework.builder().school(school()).teacher(teacher()).grade(r.grade()).section(r.section()).subject(r.subject())
                .title(r.title()).description(r.description()).dueDate(r.dueDate()).attachmentUrl(r.attachmentUrl()).build();
        em.persist(h);
        return ApiResponse.success(homework(h));
    }

    @PutMapping("/api/v1/teacher/homework/{id}")
    @Transactional
    public ApiResponse<?> homeworkUpdate(@PathVariable Long id, @RequestBody AcademicRequest r) {
        Homework h = em.find(Homework.class, id);
        if (h == null || !h.getTeacher().getId().equals(teacher().getId())) throw new ResourceNotFoundException("Homework not found");
        if (r.title() != null) h.setTitle(r.title());
        if (r.description() != null) h.setDescription(r.description());
        if (r.dueDate() != null) h.setDueDate(r.dueDate());
        return ApiResponse.success(homework(h));
    }

    @DeleteMapping("/api/v1/teacher/homework/{id}")
    @Transactional
    public ApiResponse<Void> homeworkDelete(@PathVariable Long id) {
        Homework h = em.find(Homework.class, id);
        if (h == null || !h.getTeacher().getId().equals(teacher().getId())) throw new ResourceNotFoundException("Homework not found");
        h.setActive(false);
        return ApiResponse.success("Homework removed", null);
    }

    @GetMapping("/api/v1/teacher/study-materials")
    @Transactional(readOnly = true)
    public ApiResponse<?> materials() {
        return ApiResponse.success(em.createQuery("select m from StudyMaterial m where m.teacher.id=:t and m.active=true order by m.createdAt desc", StudyMaterial.class)
                .setParameter("t", teacher().getId()).getResultList().stream().map(this::material).toList());
    }

    @PostMapping("/api/v1/teacher/study-materials")
    @Transactional
    public ApiResponse<?> materialCreate(@RequestBody AcademicRequest r) {
        StudyMaterial m = StudyMaterial.builder().school(school()).teacher(teacher()).grade(r.grade()).section(r.section())
                .subject(r.subject()).title(r.title()).description(r.description()).fileUrl(r.fileUrl()).build();
        em.persist(m);
        return ApiResponse.success(material(m));
    }

    @PutMapping("/api/v1/teacher/study-materials/{id}")
    @Transactional
    public ApiResponse<?> materialUpdate(@PathVariable Long id, @RequestBody AcademicRequest r) {
        StudyMaterial m = em.find(StudyMaterial.class, id);
        if (m == null || !m.getTeacher().getId().equals(teacher().getId())) throw new ResourceNotFoundException("Study material not found");
        if (r.title() != null) m.setTitle(r.title());
        if (r.description() != null) m.setDescription(r.description());
        if (r.fileUrl() != null) m.setFileUrl(r.fileUrl());
        return ApiResponse.success(material(m));
    }

    @DeleteMapping("/api/v1/teacher/study-materials/{id}")
    @Transactional
    public ApiResponse<Void> materialDelete(@PathVariable Long id) {
        StudyMaterial m = em.find(StudyMaterial.class, id);
        if (m == null || !m.getTeacher().getId().equals(teacher().getId())) throw new ResourceNotFoundException("Study material not found");
        m.setActive(false);
        return ApiResponse.success("Study material removed", null);
    }

    @PutMapping("/api/v1/teacher/exams/{examId}/results/{studentId}")
    @Transactional
    public ApiResponse<?> teacherResult(@PathVariable Long examId, @PathVariable Long studentId, @RequestBody AcademicRequest r) {
        return result(examId, studentId, r);
    }

    @GetMapping("/api/v1/teacher/exams")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherExams() {
        return exams();
    }

    @PostMapping("/api/v1/teacher/leaves")
    @Transactional
    public ApiResponse<?> teacherLeave(@RequestBody AcademicRequest r) {
        Teacher t = teacher();
        LeaveRequest l = LeaveRequest.builder().school(school()).requesterUserId(SecurityUtils.getCurrentUserIdOptional().orElseThrow())
                .requesterRole("TEACHER").teacher(t).leaveType(r.leaveType() == null ? "GENERAL" : r.leaveType())
                .fromDate(r.fromDate()).toDate(r.toDate()).reason(r.reason()).status("PENDING").build();
        em.persist(l);
        return ApiResponse.success(leave(l));
    }

    @GetMapping("/api/v1/teacher/leaves")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherLeaves() {
        return ApiResponse.success(em.createQuery("select l from LeaveRequest l where l.teacher.id=:t order by l.createdAt desc", LeaveRequest.class)
                .setParameter("t", teacher().getId()).getResultList().stream().map(this::leave).toList());
    }

    @GetMapping("/api/v1/teacher/live-tracking-stats")
    @Transactional(readOnly = true)
    public ApiResponse<?> trackingStats() {
        Long schoolId = sid();
        long onlineDrivers = em.createQuery("select count(d) from Driver d where d.school.id=:s and d.online=true", Long.class)
                .setParameter("s", schoolId)
                .getSingleResult();
        long runningTrips = em.createQuery(
                        "select count(t) from Trip t where t.school.id=:s and t.status=com.schoolbus.entity.enums.TripStatus.IN_PROGRESS",
                        Long.class)
                .setParameter("s", schoolId)
                .getSingleResult();
        long activeBuses = em.createQuery(
                        "select count(b) from Bus b where b.school.id=:s and b.status=com.schoolbus.entity.enums.BusStatus.ACTIVE",
                        Long.class)
                .setParameter("s", schoolId)
                .getSingleResult();

        List<Map<String, Object>> tracks = em
                .createQuery(
                        "select db from DriverBus db where db.driver.school.id=:s and db.active=true order by db.assignedFrom desc",
                        DriverBus.class)
                .setParameter("s", schoolId)
                .getResultList()
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        db -> db.getDriver().getId(),
                        db -> db,
                        (first, ignored) -> first,
                        java.util.LinkedHashMap::new))
                .values()
                .stream()
                .map(db -> {
                    Driver d = db.getDriver();
                    Route route = db.getRoute();
                    List<RouteStop> routeStops = route == null
                            ? List.of()
                            : em.createQuery(
                                            "select s from RouteStop s where s.route.id=:r order by s.stopOrder",
                                            RouteStop.class)
                                    .setParameter("r", route.getId())
                                    .getResultList();
                    List<Map<String, Object>> stops = routeStops.stream()
                            .map(stop -> {
                                Map<String, Object> m = new HashMap<>();
                                m.put("id", stop.getId());
                                m.put("name", stop.getName());
                                m.put("stopOrder", stop.getStopOrder());
                                m.put("latitude", stop.getLatitude());
                                m.put("longitude", stop.getLongitude());
                                m.put("address", stop.getAddress());
                                return m;
                            })
                            .toList();
                    Map<String, Object> row = new HashMap<>();
                    row.put("driverId", d.getId());
                    row.put("driverName", d.getUser().getFullName());
                    row.put("online", d.getOnline());
                    row.put("locationEnabled", d.getLocationEnabled());
                    row.put("latitude", d.getLastLatitude());
                    row.put("longitude", d.getLastLongitude());
                    row.put("lastLocationAt", d.getLastLocationAt());
                    row.put("busNumber", db.getBus().getBusNumber());
                    row.put("routeId", route == null ? null : route.getId());
                    row.put("routeName", route == null ? null : route.getName());
                    row.put("tripStatus", Boolean.TRUE.equals(d.getOnline()) ? "IN_PROGRESS" : "OFFLINE");
                    row.put("stops", stops);
                    return row;
                })
                .toList();

        return ApiResponse.success(Map.of(
                "onlineDrivers", onlineDrivers,
                "runningTrips", runningTrips,
                "activeBuses", activeBuses,
                "tracks", tracks));
    }

    @GetMapping("/api/v1/teacher/notices")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherNotices() {
        return notices();
    }

    @GetMapping("/api/v1/teacher/calendar")
    @Transactional(readOnly = true)
    public ApiResponse<?> teacherCalendar() {
        return calendar();
    }

    @GetMapping("/api/v1/student/academic/timetable")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentTimetable(@RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        return ApiResponse.success(em.createQuery("select t from TimetableSlot t where t.school.id=:x and t.grade=:g and t.section=:q and t.active=true order by t.dayOfWeek,t.periodNo", TimetableSlot.class)
                .setParameter("x", sid()).setParameter("g", s.getGrade()).setParameter("q", s.getSection())
                .getResultList().stream().map(this::slot).toList());
    }

    @GetMapping("/api/v1/student/academic/attendance")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentAttendance(@RequestParam(required = false) Long studentId) {
        return ApiResponse.success(em.createQuery("select a from ClassAttendance a join fetch a.student where a.student.id=:s order by a.attendanceDate desc", ClassAttendance.class)
                .setParameter("s", student(studentId).getId()).getResultList().stream().map(this::attendance).toList());
    }

    @GetMapping("/api/v1/student/academic/homework")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentHomework(@RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        return ApiResponse.success(em.createQuery("select h from Homework h where h.school.id=:x and h.grade=:g and h.section=:q and h.active=true order by h.dueDate desc", Homework.class)
                .setParameter("x", sid()).setParameter("g", s.getGrade()).setParameter("q", s.getSection())
                .getResultList().stream().map(this::homework).toList());
    }

    @GetMapping("/api/v1/student/academic/study-materials")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentMaterials(@RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        return ApiResponse.success(em.createQuery("select m from StudyMaterial m where m.school.id=:x and m.grade=:g and m.section=:q and m.active=true order by m.createdAt desc", StudyMaterial.class)
                .setParameter("x", sid()).setParameter("g", s.getGrade()).setParameter("q", s.getSection())
                .getResultList().stream().map(this::material).toList());
    }

    @GetMapping("/api/v1/student/academic/exams")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentExams(@RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        return ApiResponse.success(em.createQuery("select e from Exam e where e.school.id=:x and e.grade=:g and e.active=true order by e.examDate desc", Exam.class)
                .setParameter("x", sid()).setParameter("g", s.getGrade())
                .getResultList().stream().map(this::exam).toList());
    }

    @GetMapping("/api/v1/student/academic/exam-results")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentResults(@RequestParam(required = false) Long studentId) {
        return ApiResponse.success(em.createQuery("select r from ExamResult r join fetch r.exam join fetch r.student where r.student.id=:s", ExamResult.class)
                .setParameter("s", student(studentId).getId()).getResultList().stream().map(this::result).toList());
    }

    @GetMapping("/api/v1/student/academic/fees")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentFees(@RequestParam(required = false) Long studentId) {
        return ApiResponse.success(em.createQuery("select f from FeeInvoice f join fetch f.student where f.student.id=:s order by f.dueDate desc", FeeInvoice.class)
                .setParameter("s", student(studentId).getId()).getResultList().stream().map(this::fee).toList());
    }

    @GetMapping("/api/v1/student/academic/notices")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentNotices() {
        return notices();
    }

    @GetMapping("/api/v1/student/academic/calendar")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentCalendar() {
        return calendar();
    }

    @PostMapping("/api/v1/student/academic/leaves")
    @Transactional
    public ApiResponse<?> studentLeave(@RequestBody AcademicRequest r, @RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        LeaveRequest l = LeaveRequest.builder().school(school()).requesterUserId(SecurityUtils.getCurrentUserIdOptional().orElseThrow())
                .requesterRole("STUDENT").student(s).leaveType(r.leaveType() == null ? "GENERAL" : r.leaveType())
                .fromDate(r.fromDate()).toDate(r.toDate()).reason(r.reason()).status("PENDING").build();
        em.persist(l);
        return ApiResponse.success(leave(l));
    }

    @GetMapping("/api/v1/student/academic/leaves")
    @Transactional(readOnly = true)
    public ApiResponse<?> studentLeaves(@RequestParam(required = false) Long studentId) {
        return ApiResponse.success(em.createQuery("select l from LeaveRequest l where l.student.id=:s order by l.createdAt desc", LeaveRequest.class)
                .setParameter("s", student(studentId).getId()).getResultList().stream().map(this::leave).toList());
    }

    @GetMapping("/api/v1/student/academic/profile-documents")
    @Transactional(readOnly = true)
    public ApiResponse<?> documents(@RequestParam(required = false) Long studentId) {
        Student s = student(studentId);
        Map<String, Object> m = map();
        m.put("studentCode", s.getStudentCode());
        m.put("name", s.getFullName());
        m.put("grade", s.getGrade());
        m.put("section", s.getSection());
        m.put("pickupAddress", Objects.toString(s.getPickupAddress(), ""));
        m.put("dropAddress", Objects.toString(s.getDropAddress(), ""));
        m.put("photoUrl", Objects.toString(s.getPhotoUrl(), ""));
        return ApiResponse.success(m);
    }
}
