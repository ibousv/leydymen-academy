package com.leydymen.app.dto.request;

import com.leydymen.app.entity.StudentProgress.ProgressStatus;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressUpdateRequest {
    @NotNull(message = "Lesson ID is required")
    private Long lessonId;

    @NotNull(message = "Status is required")
    private ProgressStatus status;

    @Min(value = 0, message = "Percentage watched must be between 0 and 100")
    @Max(value = 100, message = "Percentage watched must be between 0 and 100")
    private Float percentageWatched;
}
