package com.leydymen.app.repository;

import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.Lesson.LessonStatus;
import com.leydymen.app.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByModule(Module module);

    List<Lesson> findByModuleOrderByLessonOrderAsc(Module module);

    List<Lesson> findByStatus(LessonStatus status);

    @Query("SELECT l FROM Lesson l WHERE l.module = :module ORDER BY l.lessonOrder ASC")
    List<Lesson> findLessonsByModuleOrdered(@Param("module") Module module);

    @Query("SELECT l FROM Lesson l WHERE l.module.formation.formationId = :formationId")
    List<Lesson> findLessonsByFormationId(@Param("formationId") Long formationId);

    long countByModule(Module module);
}
