package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalDate;
@Entity @Table(name="salary_records") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryRecord extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher;
 private String monthLabel; private BigDecimal grossAmount,deductions,netAmount; private String status; private LocalDate paidOn; private String notes;
}
