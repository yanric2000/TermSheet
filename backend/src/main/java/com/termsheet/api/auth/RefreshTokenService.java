package com.termsheet.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final int RAW_TOKEN_BYTES = 48;

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository) {
        this.repository = repository;
    }

    public record IssuedToken(String rawToken, RefreshToken entity) {
    }

    @Transactional
    public IssuedToken issue(UUID userId, Duration ttl, String userAgent, String ipAddress) {
        String rawToken = generateRawToken();
        Instant expiresAt = Instant.now().plus(ttl);
        RefreshToken token = new RefreshToken(
                UUID.randomUUID(),
                userId,
                hash(rawToken),
                expiresAt,
                truncate(userAgent, 500),
                truncate(ipAddress, 64)
        );
        RefreshToken saved = repository.save(token);
        return new IssuedToken(rawToken, saved);
    }

    @Transactional
    public IssuedToken rotate(String rawToken, Duration ttl, String userAgent, String ipAddress) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException(
                    InvalidRefreshTokenException.Reason.MISSING,
                    "Refresh token is missing");
        }
        String hash = hash(rawToken);
        RefreshToken existing = repository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidRefreshTokenException(
                        InvalidRefreshTokenException.Reason.UNKNOWN,
                        "Refresh token is unknown"));

        Instant now = Instant.now();

        if (existing.isRevoked()) {
            log.warn("Refresh token reuse detected for user {} - revoking entire family",
                    existing.getUserId());
            repository.revokeAllActiveByUserId(existing.getUserId(), now);
            throw new InvalidRefreshTokenException(
                    InvalidRefreshTokenException.Reason.REUSE_DETECTED,
                    "Refresh token reuse detected");
        }

        if (!existing.isActive(now)) {
            throw new InvalidRefreshTokenException(
                    InvalidRefreshTokenException.Reason.EXPIRED,
                    "Refresh token is expired");
        }

        IssuedToken next = issue(existing.getUserId(), ttl, userAgent, ipAddress);
        existing.revoke(now, next.entity().getId());
        repository.save(existing);
        return next;
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        repository.findByTokenHash(hash(rawToken))
                .filter(token -> !token.isRevoked())
                .ifPresent(token -> {
                    token.revoke(Instant.now(), null);
                    repository.save(token);
                });
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        repository.revokeAllActiveByUserId(userId, Instant.now());
    }

    @Transactional
    public int deleteExpiredBefore(Instant before) {
        return repository.deleteAllByExpiresAtBefore(before);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[RAW_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return null;
        }
        return value.length() <= max ? value : value.substring(0, max);
    }
}
