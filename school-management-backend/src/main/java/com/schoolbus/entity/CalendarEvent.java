package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDate;
@Entity @Table(name="calendar_events") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarEvent extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; private String title; @Column(columnDefinition="TEXT") private String description; private LocalDate eventDate,endDate; private String eventType,audience; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
