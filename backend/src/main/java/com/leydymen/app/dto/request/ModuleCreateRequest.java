package com.leydymen.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleCreateRequest {
    @NotNull(message = "Formation ID is required")
    private Long formationId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Integer moduleOrder;
}
