package com.leydymen.app.repository;

import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByStudentAndFormation(User student, Formation formation);

    Page<Enrollment> findByStudent(User student, Pageable pageable);

    Page<Enrollment> findByFormation(Formation formation, Pageable pageable);

    Page<Enrollment> findByStudentAndStatus(User student, EnrollmentStatus status, Pageable pageable);

    Page<Enrollment> findByFormationAndStatus(Formation formation, EnrollmentStatus status, Pageable pageable);

    List<Enrollment> findByFormation(Formation formation);

    List<Enrollment> findByStudent(User student);

    @Query("SELECT e FROM Enrollment e WHERE e.student = :student AND e.status = 'COMPLETED'")
    List<Enrollment> findCompletedEnrollmentsByStudent(@Param("student") User student);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.formation = :formation AND e.status = 'ACTIVE'")
    long countActiveEnrollmentsByFormation(@Param("formation") Formation formation);

    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.formation = :formation AND e.status = 'COMPLETED'")
    long countCompletedEnrollmentsByFormation(@Param("formation") Formation formation);

    @Query("SELECT AVG(e.completionPercentage) FROM Enrollment e WHERE e.formation = :formation")
    Double getAverageCompletionPercentageByFormation(@Param("formation") Formation formation);

    long countByFormation(Formation formation);

    long countByStudent(User student);

    long countByStatus(EnrollmentStatus status);
}
