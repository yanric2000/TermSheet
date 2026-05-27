package com.termsheet.api.auth.dto;

import com.termsheet.api.user.User;

import java.util.UUID;

public record UserResponse(UUID id, String username, String name, String role) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getName(), user.getRole().name());
    }
}
