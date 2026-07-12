package com.schoolbus.entity;
import jakarta.persistence.*; import lombok.*;
@Entity @Table(name="study_materials") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudyMaterial extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="school_id") private School school; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="teacher_id") private Teacher teacher;
 private String grade,section,subject,title; @Column(columnDefinition="TEXT") private String description; @Column(name="file_url") private String fileUrl; @Builder.Default @Column(name="is_active") private Boolean active=true;
}
