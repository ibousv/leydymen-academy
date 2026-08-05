package com.leydymen.app.dto.response;

import com.leydymen.app.entity.User.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String token;
    private String refreshToken;
    private UserRole role;
    private Long expiresIn;
}
