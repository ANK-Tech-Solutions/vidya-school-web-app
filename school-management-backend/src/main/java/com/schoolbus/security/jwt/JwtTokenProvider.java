package com.schoolbus.security.jwt;

import com.schoolbus.config.JwtProperties;
import com.schoolbus.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {
    private static final String TOKEN_TYPE_CLAIM = "token_type";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";
    private final JwtProperties jwtProperties;
    private SecretKey signingKey;

    @PostConstruct
    void initialize() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) throw new IllegalStateException("JWT secret must be at least 256 bits");
        signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(UserPrincipal principal) {
        List<String> roles = principal.getAuthorities().stream().map(authority -> authority.getAuthority()).toList();
        return createToken(principal.getUsername(), ACCESS_TOKEN, jwtProperties.getAccessTokenExpirationMs(),
                builder -> builder.claim("userId", principal.getId()).claim("roles", roles));
    }

    public String createRefreshToken(UserPrincipal principal) {
        return createToken(principal.getUsername(), REFRESH_TOKEN, jwtProperties.getRefreshTokenExpirationMs(), builder -> builder);
    }

    public boolean isValidAccessToken(String token) { return isValidToken(token, ACCESS_TOKEN); }
    public boolean isValidRefreshToken(String token) { return isValidToken(token, REFRESH_TOKEN); }

    public String getUsername(String token) { return parseClaims(token).getPayload().getSubject(); }
    public long getAccessTokenExpirationMs() { return jwtProperties.getAccessTokenExpirationMs(); }
    public Instant getExpiration(String token) { return parseClaims(token).getPayload().getExpiration().toInstant(); }

    private boolean isValidToken(String token, String expectedType) {
        try { return expectedType.equals(parseClaims(token).getPayload().get(TOKEN_TYPE_CLAIM, String.class)); }
        catch (RuntimeException exception) { return false; }
    }

    private String createToken(String subject, String type, long durationMs,
                               java.util.function.UnaryOperator<io.jsonwebtoken.JwtBuilder> customizer) {
        Instant now = Instant.now();
        return customizer.apply(Jwts.builder().issuer(jwtProperties.getIssuer()).subject(subject).issuedAt(Date.from(now))
                        .expiration(Date.from(now.plusMillis(durationMs))).claim(TOKEN_TYPE_CLAIM, type))
                .signWith(signingKey).compact();
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser().verifyWith(signingKey).requireIssuer(jwtProperties.getIssuer()).build().parseSignedClaims(token);
    }
}
