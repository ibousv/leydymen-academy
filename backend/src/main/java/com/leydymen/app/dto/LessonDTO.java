package com.leydymen.app.dto;

import com.leydymen.app.entity.Lesson.LessonStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonDTO {
    private Long lessonId;
    private Long moduleId;
    private String title;
    private String content;
    private String videoUrl;
    private Integer duration;
    private Integer lessonOrder;
    private LessonStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
