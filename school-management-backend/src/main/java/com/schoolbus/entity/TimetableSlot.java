package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalTime;
@Entity @Table(name="timetable_slots") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TimetableSlot extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school;
 private String grade,section,subject,room; private Integer dayOfWeek,periodNo; private LocalTime startTime,endTime; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
