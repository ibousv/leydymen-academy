package com.leydymen.app.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonCreateRequest {
    @NotNull(message = "Module ID is required")
    private Long moduleId;

    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    private String videoUrl;

    private Integer duration;

    private Integer lessonOrder;
}
