package com.leydymen.app.dto;

import com.leydymen.app.entity.StudentProgress.ProgressStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProgressDTO {
    private Long progressId;
    private Long studentId;
    private Long lessonId;
    private Long enrollmentId;
    private ProgressStatus status;
    private Float percentageWatched;
    private LocalDateTime completedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
