package com.karigarnow.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank(message = "Google token is required")
    private String googleToken;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(consumer|thekedar)$", message = "Role must be 'consumer' or 'thekedar'")
    private String role;
}
