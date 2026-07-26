package com.leydymen.app.mapper;

import com.leydymen.app.dto.LessonDTO;
import com.leydymen.app.entity.Lesson;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LessonMapper {
    @Mapping(source = "module.moduleId", target = "moduleId")
    LessonDTO toDTO(Lesson lesson);

    @Mapping(source = "moduleId", target = "module.moduleId")
    Lesson toEntity(LessonDTO lessonDTO);

    void updateEntityFromDTO(LessonDTO lessonDTO, @MappingTarget Lesson lesson);
}
