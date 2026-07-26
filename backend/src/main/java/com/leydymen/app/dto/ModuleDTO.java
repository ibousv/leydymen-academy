package com.leydymen.app.dto;

import com.leydymen.app.entity.Module.ModuleStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleDTO {
    private Long moduleId;
    private Long formationId;
    private String title;
    private String description;
    private Integer moduleOrder;
    private ModuleStatus status;
    private List<LessonDTO> lessons;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
