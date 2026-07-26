package com.leydymen.app.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentCreateRequest {
    @NotNull(message = "Formation ID is required")
    private Long formationId;
}
