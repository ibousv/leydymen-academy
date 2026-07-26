package com.leydymen.app.dto;

import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {
    private Long enrollmentId;
    private Long studentId;
    private Long formationId;
    private LocalDate enrollmentDate;
    private EnrollmentStatus status;
    private Float completionPercentage;
    private String certificateUrl;
    private String grade;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
