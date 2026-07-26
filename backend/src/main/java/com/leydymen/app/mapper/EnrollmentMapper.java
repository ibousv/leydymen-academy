package com.leydymen.app.mapper;

import com.leydymen.app.dto.EnrollmentDTO;
import com.leydymen.app.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "formation.formationId", target = "formationId")
    EnrollmentDTO toDTO(Enrollment enrollment);

    @Mapping(source = "studentId", target = "student.userId")
    @Mapping(source = "formationId", target = "formation.formationId")
    Enrollment toEntity(EnrollmentDTO enrollmentDTO);

    void updateEntityFromDTO(EnrollmentDTO enrollmentDTO, @MappingTarget Enrollment enrollment);
}
