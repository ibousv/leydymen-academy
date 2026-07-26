package com.leydymen.app.mapper;

import com.leydymen.app.dto.ModuleDTO;
import com.leydymen.app.entity.Module;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {LessonMapper.class})
public interface ModuleMapper {
    @Mapping(source = "formation.formationId", target = "formationId")
    ModuleDTO toDTO(Module module);

    @Mapping(source = "formationId", target = "formation.formationId")
    Module toEntity(ModuleDTO moduleDTO);

    void updateEntityFromDTO(ModuleDTO moduleDTO, @MappingTarget Module module);
}
