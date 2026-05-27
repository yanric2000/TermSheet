package com.termsheet.api.auth;

public class InvalidRefreshTokenException extends RuntimeException {

    public enum Reason {
        MISSING,
        UNKNOWN,
        EXPIRED,
        REVOKED,
        REUSE_DETECTED
    }

    private final Reason reason;

    public InvalidRefreshTokenException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
