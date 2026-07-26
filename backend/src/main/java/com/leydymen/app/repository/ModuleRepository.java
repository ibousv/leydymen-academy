package com.leydymen.app.repository;

import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.Module;
import com.leydymen.app.entity.Module.ModuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByFormation(Formation formation);

    List<Module> findByFormationOrderByModuleOrderAsc(Formation formation);

    List<Module> findByStatus(ModuleStatus status);

    @Query("SELECT m FROM Module m WHERE m.formation = :formation ORDER BY m.moduleOrder ASC")
    List<Module> findModulesByFormationOrdered(@Param("formation") Formation formation);

    long countByFormation(Formation formation);
}
