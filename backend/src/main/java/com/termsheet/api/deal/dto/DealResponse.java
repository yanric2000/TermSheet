package com.termsheet.api.deal.dto;

import com.termsheet.api.deal.Deal;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DealResponse(
        UUID id,
        String name,
        BigDecimal purchasePrice,
        String address,
        BigDecimal noi,
        BigDecimal capRate,
        String description,
        UUID ownerId,
        Instant createdAt,
        Instant updatedAt
) {

    public static DealResponse from(Deal deal) {
        return new DealResponse(
                deal.getId(),
                deal.getName(),
                deal.getPurchasePrice(),
                deal.getAddress(),
                deal.getNoi(),
                deal.getCapRate(),
                deal.getDescription(),
                deal.getOwnerId(),
                deal.getCreatedAt(),
                deal.getUpdatedAt()
        );
    }
}
