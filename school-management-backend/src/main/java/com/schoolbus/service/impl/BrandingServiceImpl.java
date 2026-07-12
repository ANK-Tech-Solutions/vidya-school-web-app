package com.schoolbus.service.impl;
import com.schoolbus.dto.request.BrandingRequest; import com.schoolbus.dto.response.BrandingResponse; import com.schoolbus.entity.School; import com.schoolbus.exception.ResourceNotFoundException; import com.schoolbus.repository.SchoolRepository; import com.schoolbus.service.BrandingService; import com.schoolbus.util.SecurityUtils; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor public class BrandingServiceImpl implements BrandingService {
 private static final String NAME="ANK-School-managment", ICON="https://drive.google.com/uc?export=view&id=1oThTuOXW8fvrXUJHNDRBARkgc10Qg5lV"; private final SchoolRepository schools;
 @Transactional(readOnly=true) public BrandingResponse publicBranding(){return schools.findAll().stream().filter(s->Boolean.TRUE.equals(s.getActive())).findFirst().map(BrandingResponse::from).orElse(new BrandingResponse(NAME,ICON));}
 @Transactional(readOnly=true) public BrandingResponse current(){return BrandingResponse.from(school());}
 @Transactional public BrandingResponse update(BrandingRequest r){School s=school();s.setAppName(r.appName());s.setAppIconUrl(r.appIconUrl());return BrandingResponse.from(s);}
 private School school(){return schools.findById(SecurityUtils.getCurrentSchoolId()).orElseThrow(()->new ResourceNotFoundException("School not found"));}
}
