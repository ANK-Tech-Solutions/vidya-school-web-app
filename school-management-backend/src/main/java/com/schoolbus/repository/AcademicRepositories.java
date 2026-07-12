package com.schoolbus.repository;
import com.schoolbus.entity.*; import org.springframework.data.jpa.repository.JpaRepository;
interface NoticeBoardRepository extends JpaRepository<NoticeBoard,Long> {}
interface TimetableSlotRepository extends JpaRepository<TimetableSlot,Long> {}
interface ClassAttendanceRepository extends JpaRepository<ClassAttendance,Long> {}
interface HomeworkRepository extends JpaRepository<Homework,Long> {}
interface StudyMaterialRepository extends JpaRepository<StudyMaterial,Long> {}
interface ExamRepository extends JpaRepository<Exam,Long> {}
interface ExamResultRepository extends JpaRepository<ExamResult,Long> {}
interface FeeInvoiceRepository extends JpaRepository<FeeInvoice,Long> {}
interface SalaryRecordRepository extends JpaRepository<SalaryRecord,Long> {}
interface LeaveRequestRepository extends JpaRepository<LeaveRequest,Long> {}
interface CalendarEventRepository extends JpaRepository<CalendarEvent,Long> {}
