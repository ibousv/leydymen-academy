package com.leydymen.app.repository;

import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Lesson;
import com.leydymen.app.entity.StudentProgress;
import com.leydymen.app.entity.StudentProgress.ProgressStatus;
import com.leydymen.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    Optional<StudentProgress> findByStudentAndLesson(User student, Lesson lesson);

    List<StudentProgress> findByStudent(User student);

    List<StudentProgress> findByLesson(Lesson lesson);

    List<StudentProgress> findByEnrollment(Enrollment enrollment);

    List<StudentProgress> findByStudentAndStatus(User student, ProgressStatus status);

    @Query("SELECT sp FROM StudentProgress sp WHERE " +
            "sp.enrollment = :enrollment ORDER BY sp.createdAt ASC")
    List<StudentProgress> findProgressByEnrollment(@Param("enrollment") Enrollment enrollment);

    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE " +
            "sp.enrollment = :enrollment AND sp.status = 'COMPLETED'")
    long countCompletedLessonsByEnrollment(@Param("enrollment") Enrollment enrollment);

    @Query("SELECT COUNT(DISTINCT sp.lesson) FROM StudentProgress sp WHERE " +
            "sp.enrollment = :enrollment")
    long countTotalLessonsByEnrollment(@Param("enrollment") Enrollment enrollment);

    @Query("SELECT AVG(sp.percentageWatched) FROM StudentProgress sp WHERE " +
            "sp.enrollment = :enrollment")
    Double getAverageCompletionPercentageByEnrollment(@Param("enrollment") Enrollment enrollment);

    @Query("SELECT sp FROM StudentProgress sp WHERE " +
            "sp.student = :student AND " +
            "sp.lesson.module.formation.formationId = :formationId")
    List<StudentProgress> findProgressByStudentAndFormation(
            @Param("student") User student,
            @Param("formationId") Long formationId);

    long countByStudent(User student);

    long countByStatus(ProgressStatus status);
}
