package com.schoolbus.config;

import com.schoolbus.security.CustomUserDetailsService;
import com.schoolbus.security.jwt.JwtTokenProvider;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor, HandshakeInterceptor {
    private static final String ACCESS_TOKEN_ATTRIBUTE = "access_token";

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                                   @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
        String token = UriComponentsBuilder.fromUri(request.getURI()).build()
                .getQueryParams().getFirst(ACCESS_TOKEN_ATTRIBUTE);
        if (StringUtils.hasText(token)) {
            attributes.put(ACCESS_TOKEN_ATTRIBUTE, token);
        }
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
                               @NonNull WebSocketHandler wsHandler, Exception exception) {
        // Authentication is created when the STOMP CONNECT frame is received.
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();
        if (command == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(command)) {
            accessor.setUser(authenticate(accessor));
            return message;
        }

        Principal principal = accessor.getUser();
        if (StompCommand.SUBSCRIBE.equals(command) && principal == null) {
            throw new IllegalArgumentException("Authentication is required to subscribe to live tracking");
        }
        if (StompCommand.SEND.equals(command) && "/app/driver/location".equals(accessor.getDestination())) {
            if (!(principal instanceof Authentication authentication)
                    || authentication.getAuthorities().stream().noneMatch(a -> "ROLE_DRIVER".equals(a.getAuthority()))) {
                throw new IllegalArgumentException("Only drivers may publish location updates");
            }
        }
        return message;
    }

    private Authentication authenticate(StompHeaderAccessor accessor) {
        String token = bearerToken(accessor.getFirstNativeHeader(HttpHeaders.AUTHORIZATION));
        if (!StringUtils.hasText(token)) {
            token = accessor.getFirstNativeHeader(ACCESS_TOKEN_ATTRIBUTE);
        }
        if (!StringUtils.hasText(token) && accessor.getSessionAttributes() != null) {
            token = (String) accessor.getSessionAttributes().get(ACCESS_TOKEN_ATTRIBUTE);
        }
        if (!StringUtils.hasText(token) || !jwtTokenProvider.isValidAccessToken(token)) {
            throw new IllegalArgumentException("A valid access token is required to connect");
        }

        UserDetails user = userDetailsService.loadUserByUsername(jwtTokenProvider.getUsername(token));
        return UsernamePasswordAuthenticationToken.authenticated(user, token, user.getAuthorities());
    }

    private String bearerToken(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.startsWith("Bearer ") ? value.substring(7) : value;
    }
}
