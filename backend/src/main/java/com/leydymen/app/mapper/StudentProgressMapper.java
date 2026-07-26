package com.leydymen.app.mapper;

import com.leydymen.app.dto.StudentProgressDTO;
import com.leydymen.app.entity.StudentProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StudentProgressMapper {
    @Mapping(source = "student.userId", target = "studentId")
    @Mapping(source = "lesson.lessonId", target = "lessonId")
    @Mapping(source = "enrollment.enrollmentId", target = "enrollmentId")
    StudentProgressDTO toDTO(StudentProgress studentProgress);

    @Mapping(source = "studentId", target = "student.userId")
    @Mapping(source = "lessonId", target = "lesson.lessonId")
    @Mapping(source = "enrollmentId", target = "enrollment.enrollmentId")
    StudentProgress toEntity(StudentProgressDTO studentProgressDTO);

    void updateEntityFromDTO(StudentProgressDTO studentProgressDTO, @MappingTarget StudentProgress studentProgress);
}
