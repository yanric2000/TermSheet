package com.termsheet.api.auth;

import com.termsheet.api.config.CookieProperties;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Component
public class RefreshCookieFactory {

    private final CookieProperties properties;

    public RefreshCookieFactory(CookieProperties properties) {
        this.properties = properties;
    }

    public String getCookieName() {
        return properties.getName();
    }

    public ResponseCookie build(String value, Duration maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(properties.getName(), value)
                .httpOnly(true)
                .secure(properties.isSecure())
                .path(properties.getPath())
                .sameSite(properties.getSameSite())
                .maxAge(maxAge);
        if (StringUtils.hasText(properties.getDomain())) {
            builder.domain(properties.getDomain());
        }
        return builder.build();
    }

    public ResponseCookie expired() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(properties.getName(), "")
                .httpOnly(true)
                .secure(properties.isSecure())
                .path(properties.getPath())
                .sameSite(properties.getSameSite())
                .maxAge(Duration.ZERO);
        if (StringUtils.hasText(properties.getDomain())) {
            builder.domain(properties.getDomain());
        }
        return builder.build();
    }

    public String readFromRequest(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            if (properties.getName().equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public String headerName() {
        return HttpHeaders.SET_COOKIE;
    }
}
