package com.leydymen.app.repository;

import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.Formation.FormationLevel;
import com.leydymen.app.entity.Formation.FormationStatus;
import com.leydymen.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    Page<Formation> findByStatus(FormationStatus status, Pageable pageable);

    Page<Formation> findByInstructor(User instructor, Pageable pageable);

    Page<Formation> findByLevel(FormationLevel level, Pageable pageable);

    Page<Formation> findByCategory(String category, Pageable pageable);

    List<Formation> findByInstructor(User instructor);

    @Query("SELECT f FROM Formation f WHERE " +
            "LOWER(f.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Formation> searchFormations(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT f FROM Formation f WHERE " +
            "f.status = :status AND " +
            "f.level = :level AND " +
            "f.category = :category")
    Page<Formation> findByStatusLevelAndCategory(
            @Param("status") FormationStatus status,
            @Param("level") FormationLevel level,
            @Param("category") String category,
            Pageable pageable);

    @Query("SELECT f FROM Formation f WHERE " +
            "f.status = 'PUBLISHED' AND " +
            "f.startDate >= :startDate AND " +
            "f.endDate <= :endDate")
    List<Formation> findUpcomingFormations(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    long countByStatus(FormationStatus status);

    long countByInstructor(User instructor);
}
