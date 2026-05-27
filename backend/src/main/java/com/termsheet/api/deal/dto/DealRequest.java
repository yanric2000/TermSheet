package com.termsheet.api.deal.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record DealRequest(
        @NotBlank @Size(max = 200) String name,
        @NotNull @Positive BigDecimal purchasePrice,
        @NotBlank @Size(max = 500) String address,
        @NotNull @DecimalMin(value = "0.0", inclusive = true) BigDecimal noi,
        @Size(max = 2000) String description
) {
}
