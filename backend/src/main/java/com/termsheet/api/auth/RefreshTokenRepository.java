package com.termsheet.api.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUserIdAndRevokedAtIsNull(UUID userId);

    @Modifying
    @Query("update RefreshToken rt set rt.revokedAt = :now "
            + "where rt.userId = :userId and rt.revokedAt is null")
    int revokeAllActiveByUserId(@Param("userId") UUID userId, @Param("now") Instant now);

    @Modifying
    @Query("delete from RefreshToken rt where rt.expiresAt < :before")
    int deleteAllByExpiresAtBefore(@Param("before") Instant before);
}
