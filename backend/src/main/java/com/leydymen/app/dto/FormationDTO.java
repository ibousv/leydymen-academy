package com.leydymen.app.dto;

import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormationDTO {
    private Long formationId;
    private String title;
    private String description;
    private String category;
    private FormationLevel level;
    private Integer duration;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal price;
    private FormationStatus status;
    private String thumbnail;
    private UserDTO instructor;
    private List<ModuleDTO> modules;
    private Long enrollmentCount;
    private Double averageRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
