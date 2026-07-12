package com.schoolbus.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "schools")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class School extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "app_name", nullable = false, length = 200)
    @Builder.Default
    private String appName = "ANK-School-managment";

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    @Builder.Default
    private String country = "India";

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "app_icon_url", nullable = false, length = 1000)
    @Builder.Default
    private String appIconUrl = "https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV";

    @Column(length = 50)
    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
