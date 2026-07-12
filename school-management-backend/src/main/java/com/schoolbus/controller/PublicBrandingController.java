package com.schoolbus.controller;
import com.schoolbus.dto.request.BrandingRequest; import com.schoolbus.dto.response.*; import com.schoolbus.service.BrandingService; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.web.bind.annotation.*;
@RestController @RequiredArgsConstructor public class PublicBrandingController {
 private final BrandingService branding;
 @GetMapping("/api/v1/public/branding") public ApiResponse<BrandingResponse> publicBranding(){return ApiResponse.success(branding.publicBranding());}
 @GetMapping("/api/v1/branding") public ApiResponse<BrandingResponse> current(){return ApiResponse.success(branding.current());}
 @PutMapping("/api/v1/admin/branding") public ApiResponse<BrandingResponse> update(@Valid @RequestBody BrandingRequest request){return ApiResponse.success(branding.update(request));}
}
