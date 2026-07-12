package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal;
@Entity @Table(name="exam_results") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ExamResult extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="exam_id") private Exam exam; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id") private Student student; private BigDecimal marksObtained; private String gradeLetter,remarks; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="evaluated_by_teacher_id") private Teacher evaluatedByTeacher;
}
