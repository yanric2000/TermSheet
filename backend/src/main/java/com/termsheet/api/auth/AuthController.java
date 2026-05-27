package com.termsheet.api.auth;

import com.termsheet.api.auth.dto.LoginRequest;
import com.termsheet.api.auth.dto.LoginResponse;
import com.termsheet.api.auth.dto.RefreshResponse;
import com.termsheet.api.auth.dto.RegisterRequest;
import com.termsheet.api.auth.dto.UserResponse;
import com.termsheet.api.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshCookieFactory cookieFactory;
    private final JwtService jwtService;
    private final AppUserDetailsService appUserDetailsService;

    public AuthController(AuthService authService,
                          RefreshTokenService refreshTokenService,
                          RefreshCookieFactory cookieFactory,
                          JwtService jwtService,
                          AppUserDetailsService appUserDetailsService) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.cookieFactory = cookieFactory;
        this.jwtService = jwtService;
        this.appUserDetailsService = appUserDetailsService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest http) {
        User user = authService.authenticate(request);
        RefreshTokenService.IssuedToken issued = refreshTokenService.issue(
                user.getId(),
                jwtService.getRefreshTokenTtl(),
                http.getHeader(HttpHeaders.USER_AGENT),
                resolveClientIp(http)
        );
        ResponseCookie cookie = cookieFactory.build(issued.rawToken(), jwtService.getRefreshTokenTtl());
        String accessToken = jwtService.generateAccessToken(user);
        long expiresIn = jwtService.getAccessTokenTtl().toSeconds();
        LoginResponse body = LoginResponse.of(accessToken, expiresIn, UserResponse.from(user));
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(body);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(HttpServletRequest http) {
        String rawToken = cookieFactory.readFromRequest(http);
        RefreshTokenService.IssuedToken next = refreshTokenService.rotate(
                rawToken,
                jwtService.getRefreshTokenTtl(),
                http.getHeader(HttpHeaders.USER_AGENT),
                resolveClientIp(http)
        );
        User user = ((AppUserPrincipal) appUserDetailsService.loadUserById(next.entity().getUserId())).getUser();
        ResponseCookie cookie = cookieFactory.build(next.rawToken(), jwtService.getRefreshTokenTtl());
        String accessToken = jwtService.generateAccessToken(user);
        long expiresIn = jwtService.getAccessTokenTtl().toSeconds();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(RefreshResponse.of(accessToken, expiresIn));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest http) {
        String rawToken = cookieFactory.readFromRequest(http);
        refreshTokenService.revoke(rawToken);
        ResponseCookie cookie = cookieFactory.expired();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        return ResponseEntity.status(201).body(UserResponse.from(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal AppUserPrincipal principal) {
        return ResponseEntity.ok(UserResponse.from(principal.getUser()));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
