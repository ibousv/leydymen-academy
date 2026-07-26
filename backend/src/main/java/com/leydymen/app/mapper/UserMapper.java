package com.leydymen.app.mapper;

import com.leydymen.app.dto.UserDTO;
import com.leydymen.app.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);

    User toEntity(UserDTO userDTO);

    void updateEntityFromDTO(UserDTO userDTO, @MappingTarget User user);
}
