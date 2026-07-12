package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalDate;
@Entity @Table(name="exams") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Exam extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school;
 private String name,examType,grade,section,subject; private LocalDate examDate; private BigDecimal maxMarks; @Column(columnDefinition="TEXT") private String description; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
