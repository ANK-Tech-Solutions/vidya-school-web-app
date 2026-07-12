package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="homework") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Homework extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher;
 private String grade,section,subject,title; @Column(columnDefinition="TEXT") private String description; private LocalDate dueDate; private String attachmentUrl; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
