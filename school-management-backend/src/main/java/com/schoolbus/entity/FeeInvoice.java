package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.math.BigDecimal; import java.time.LocalDate;
@Entity @Table(name="fee_invoices") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeInvoice extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id") private Student student;
 private String title; private BigDecimal amount,paidAmount; private LocalDate dueDate; private String status,notes;
}
