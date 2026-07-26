package com.leydymen.app.mapper;

import com.leydymen.app.dto.FormationDTO;
import com.leydymen.app.entity.Formation;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ModuleMapper.class})
public interface FormationMapper {
    FormationDTO toDTO(Formation formation);

    Formation toEntity(FormationDTO formationDTO);

    void updateEntityFromDTO(FormationDTO formationDTO, @MappingTarget Formation formation);
}
