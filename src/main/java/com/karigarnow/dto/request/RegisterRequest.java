package com.karigarnow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String mobile;

    @NotNull(message = "Role is required")
    @Pattern(regexp = "^(consumer|thekedar)$", message = "Role must be 'consumer' or 'thekedar'")
    private String role;
}
