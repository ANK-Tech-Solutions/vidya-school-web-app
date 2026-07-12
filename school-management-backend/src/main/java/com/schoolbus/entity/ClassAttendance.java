package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="class_attendance") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassAttendance extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id") private Student student; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher;
 private LocalDate attendanceDate; private String status; private String remarks;
}
