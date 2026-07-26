package com.leydymen.app.service;

import com.leydymen.app.dto.FormationDTO;
import com.leydymen.app.dto.request.FormationCreateRequest;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import com.leydymen.app.entity.User;
import com.leydymen.app.mapper.FormationMapper;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FormationService {
    private final FormationRepository formationRepository;
    private final UserRepository userRepository;
    private final FormationMapper formationMapper;

    public FormationDTO getFormationById(Long formationId) {
        return formationRepository.findById(formationId)
                .map(formationMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
    }

    public PaginatedResponse<FormationDTO> getAllFormations(Pageable pageable) {
        Page<Formation> formations = formationRepository.findAll(pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public PaginatedResponse<FormationDTO> getFormationsByStatus(FormationStatus status, Pageable pageable) {
        Page<Formation> formations = formationRepository.findByStatus(status, pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public PaginatedResponse<FormationDTO> getFormationsByLevel(FormationLevel level, Pageable pageable) {
        Page<Formation> formations = formationRepository.findByLevel(level, pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public PaginatedResponse<FormationDTO> getFormationsByCategory(String category, Pageable pageable) {
        Page<Formation> formations = formationRepository.findByCategory(category, pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public PaginatedResponse<FormationDTO> searchFormations(String keyword, Pageable pageable) {
        Page<Formation> formations = formationRepository.searchFormations(keyword, pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public PaginatedResponse<FormationDTO> getFormationsByInstructor(Long instructorId, Pageable pageable) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found with ID: " + instructorId));
        Page<Formation> formations = formationRepository.findByInstructor(instructor, pageable);
        return buildPaginatedResponse(formations, pageable);
    }

    public FormationDTO createFormation(Long instructorId, FormationCreateRequest request) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new RuntimeException("Instructor not found with ID: " + instructorId));

        Formation formation = Formation.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .duration(request.getDuration())
                .maxStudents(request.getMaxStudents())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .price(request.getPrice())
                .thumbnail(request.getThumbnail())
                .instructor(instructor)
                .status(FormationStatus.DRAFT)
                .build();

        Formation savedFormation = formationRepository.save(formation);
        return formationMapper.toDTO(savedFormation);
    }

    public FormationDTO updateFormation(Long formationId, FormationCreateRequest request) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));

        formation.setTitle(request.getTitle());
        formation.setDescription(request.getDescription());
        formation.setCategory(request.getCategory());
        formation.setLevel(request.getLevel());
        formation.setDuration(request.getDuration());
        formation.setMaxStudents(request.getMaxStudents());
        formation.setStartDate(request.getStartDate());
        formation.setEndDate(request.getEndDate());
        formation.setPrice(request.getPrice());
        formation.setThumbnail(request.getThumbnail());

        Formation updatedFormation = formationRepository.save(formation);
        return formationMapper.toDTO(updatedFormation);
    }

    public void deleteFormation(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        formationRepository.delete(formation);
    }

    public FormationDTO changeFormationStatus(Long formationId, FormationStatus status) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        formation.setStatus(status);
        Formation updatedFormation = formationRepository.save(formation);
        return formationMapper.toDTO(updatedFormation);
    }

    public long getTotalFormations() {
        return formationRepository.count();
    }

    public long getFormationCountByStatus(FormationStatus status) {
        return formationRepository.countByStatus(status);
    }

    private PaginatedResponse<FormationDTO> buildPaginatedResponse(Page<Formation> page, Pageable pageable) {
        return PaginatedResponse.<FormationDTO>builder()
                .content(page.getContent().stream()
                        .map(formationMapper::toDTO)
                        .collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(pageable.getPageNumber())
                .pageSize(pageable.getPageSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
