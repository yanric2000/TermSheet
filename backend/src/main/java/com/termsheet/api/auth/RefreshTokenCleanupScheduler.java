package com.termsheet.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class RefreshTokenCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenCleanupScheduler.class);
    private static final Duration GRACE_PERIOD = Duration.ofDays(1);

    private final RefreshTokenService refreshTokenService;

    public RefreshTokenCleanupScheduler(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void purgeExpiredTokens() {
        Instant cutoff = Instant.now().minus(GRACE_PERIOD);
        int removed = refreshTokenService.deleteExpiredBefore(cutoff);
        if (removed > 0) {
            log.info("Purged {} expired refresh tokens (cutoff={})", removed, cutoff);
        }
    }
}
