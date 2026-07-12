package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*; import java.time.Instant;
@Entity @Table(name="notice_board") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NoticeBoard extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school;
 @Column(nullable=false) private String title; @Column(nullable=false,columnDefinition="TEXT") private String body; @Builder.Default private String audience="ALL"; @Builder.Default private String priority="NORMAL";
 private Instant publishedAt; private Instant expiresAt; private Long createdByUserId; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
