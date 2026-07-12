package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="teachers") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Teacher extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id",nullable=false) private User user;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id",nullable=false) private School school;
 @Column(name="employee_code",nullable=false) private String employeeCode; private String department; private String subjects;
 private LocalDate joinDate; private String phoneExtension; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
