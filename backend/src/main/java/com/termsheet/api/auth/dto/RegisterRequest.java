package com.termsheet.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 100) String username,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotBlank @Size(max = 150) String name
) {
}
