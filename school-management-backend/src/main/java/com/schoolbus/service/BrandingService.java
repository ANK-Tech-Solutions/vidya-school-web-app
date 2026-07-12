package com.schoolbus.service;
import com.schoolbus.dto.request.BrandingRequest; import com.schoolbus.dto.response.BrandingResponse;
public interface BrandingService { BrandingResponse publicBranding(); BrandingResponse current(); BrandingResponse update(BrandingRequest request); }
