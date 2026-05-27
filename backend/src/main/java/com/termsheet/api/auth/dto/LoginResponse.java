package com.termsheet.api.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {

    public static LoginResponse of(String accessToken, long expiresInSeconds, UserResponse user) {
        return new LoginResponse(accessToken, "Bearer", expiresInSeconds, user);
    }
}
