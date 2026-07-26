package com.leydymen.app.service;

import com.leydymen.app.dto.ModuleDTO;
import com.leydymen.app.dto.request.ModuleCreateRequest;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.Module;
import com.leydymen.app.entity.Module.ModuleStatus;
import com.leydymen.app.mapper.ModuleMapper;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuleService {
    private final ModuleRepository moduleRepository;
    private final FormationRepository formationRepository;
    private final ModuleMapper moduleMapper;

    public ModuleDTO getModuleById(Long moduleId) {
        return moduleRepository.findById(moduleId)
                .map(moduleMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));
    }

    public List<ModuleDTO> getModulesByFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return moduleRepository.findByFormationOrderByModuleOrderAsc(formation).stream()
                .map(moduleMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ModuleDTO createModule(ModuleCreateRequest request) {
        Formation formation = formationRepository.findById(request.getFormationId())
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + request.getFormationId()));

        Module module = Module.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .moduleOrder(request.getModuleOrder())
                .formation(formation)
                .status(ModuleStatus.DRAFT)
                .build();

        Module savedModule = moduleRepository.save(module);
        return moduleMapper.toDTO(savedModule);
    }

    public ModuleDTO updateModule(Long moduleId, ModuleCreateRequest request) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));

        module.setTitle(request.getTitle());
        module.setDescription(request.getDescription());
        module.setModuleOrder(request.getModuleOrder());

        Module updatedModule = moduleRepository.save(module);
        return moduleMapper.toDTO(updatedModule);
    }

    public void deleteModule(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));
        moduleRepository.delete(module);
    }

    public ModuleDTO changeModuleStatus(Long moduleId, ModuleStatus status) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));
        module.setStatus(status);
        Module updatedModule = moduleRepository.save(module);
        return moduleMapper.toDTO(updatedModule);
    }

    public long getModuleCountByFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        return moduleRepository.countByFormation(formation);
    }
}
