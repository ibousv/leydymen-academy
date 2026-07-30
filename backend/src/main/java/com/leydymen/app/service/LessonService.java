package com.leydymen.app.service;

import com.leydymen.app.dto.LessonDTO;
import com.leydymen.app.dto.request.LessonCreateRequest;
import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.Lesson.LessonStatus;
import com.leydymen.app.entity.Module;
import com.leydymen.app.repository.LessonRepository;
import com.leydymen.app.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LessonService {
    private final LessonRepository lessonRepository;
    private final ModuleRepository moduleRepository;

    public LessonDTO getLessonById(Long lessonId) {
        return lessonRepository.findById(lessonId)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));
    }

    public List<LessonDTO> getLessonsByModule(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));
        return lessonRepository.findByModuleOrderByLessonOrderAsc(module).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public LessonDTO createLesson(LessonCreateRequest request) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + request.getModuleId()));

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
                .lessonOrder(request.getLessonOrder())
                .module(module)
                .status(LessonStatus.DRAFT)
                .build();

        Lesson savedLesson = lessonRepository.save(lesson);
        return toDTO(savedLesson);
    }

    public LessonDTO updateLesson(Long lessonId, LessonCreateRequest request) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDuration(request.getDuration());
        lesson.setLessonOrder(request.getLessonOrder());

        Lesson updatedLesson = lessonRepository.save(lesson);
        return toDTO(updatedLesson);
    }

    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));
        lessonRepository.delete(lesson);
    }

    public LessonDTO changeLessonStatus(Long lessonId, LessonStatus status) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found with ID: " + lessonId));
        lesson.setStatus(status);
        Lesson updatedLesson = lessonRepository.save(lesson);
        return toDTO(updatedLesson);
    }

    public long getLessonCountByModule(Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with ID: " + moduleId));
        return lessonRepository.countByModule(module);
    }

    private LessonDTO toDTO(Lesson lesson) {
        return LessonDTO.builder()
                .lessonId(lesson.getLessonId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .duration(lesson.getDuration())
                .lessonOrder(lesson.getLessonOrder())
                .moduleId(lesson.getModule() != null ? lesson.getModule().getModuleId() : null)
                .status(lesson.getStatus())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }
}
