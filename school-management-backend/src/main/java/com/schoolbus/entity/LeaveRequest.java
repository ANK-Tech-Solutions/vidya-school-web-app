package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="leave_requests") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveRequest extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; private Long requesterUserId; private String requesterRole; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="student_id") private Student student; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher;
 private String leaveType; private LocalDate fromDate,toDate; private String reason,status,adminRemark; private Long reviewedByUserId;
}
