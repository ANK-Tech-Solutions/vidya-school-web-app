package com.schoolbus.dto.response;
import com.schoolbus.entity.School;
public record BrandingResponse(String appName,String appIconUrl) { public static BrandingResponse from(School s){return new BrandingResponse(s.getAppName(),s.getAppIconUrl());} }
