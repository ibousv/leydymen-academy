package com.leydymen.app.service;

import com.leydymen.app.entity.Enrollment;
import com.leydymen.app.entity.Enrollment.EnrollmentStatus;
import com.leydymen.app.entity.Formation;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.repository.EnrollmentRepository;
import com.leydymen.app.repository.FormationRepository;
import com.leydymen.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {
    private final UserRepository userRepository;
    private final FormationRepository formationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final EnrollmentService enrollmentService;

    /**
     * Get overall platform statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalInstructors = userRepository.countByRole(UserRole.INSTRUCTOR);
        long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
        long totalUsers = userRepository.count();
        
        // Formation statistics
        long totalFormations = formationRepository.count();
        long publishedFormations = formationRepository.countByStatus(Formation.FormationStatus.PUBLISHED);
        long draftFormations = formationRepository.countByStatus(Formation.FormationStatus.DRAFT);
        
        // Enrollment statistics
        long totalEnrollments = enrollmentRepository.count();
        long activeEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.ACTIVE);
        long completedEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.COMPLETED);
        long pendingEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.PENDING);
        
        // Calculate averages
        Double averageCompletionRate = calculateAverageCompletionRate();
        
        // Calculate revenue (assuming all completed enrollments paid full price)
        Double totalRevenue = calculateTotalRevenue();
        
        // Build response
        stats.put("totalUsers", totalUsers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalInstructors", totalInstructors);
        stats.put("totalAdmins", totalAdmins);
        stats.put("totalFormations", totalFormations);
        stats.put("publishedFormations", publishedFormations);
        stats.put("draftFormations", draftFormations);
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("activeEnrollments", activeEnrollments);
        stats.put("completedEnrollments", completedEnrollments);
        stats.put("pendingEnrollments", pendingEnrollments);
        stats.put("averageCompletionRate", averageCompletionRate != null ? averageCompletionRate : 0.0);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);
        stats.put("lastUpdate", System.currentTimeMillis());
        
        return stats;
    }

    /**
     * Get statistics for a specific formation
     */
    public Map<String, Object> getFormationStatistics(Long formationId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found with ID: " + formationId));
        
        Map<String, Object> stats = new HashMap<>();
        
        // Get all enrollments for this formation
        List<Enrollment> enrollments = enrollmentRepository.findByFormation(formation);
        
        // Calculate statistics
        long totalEnrollments = enrollments.size();
        long activeEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .count();
        long completedEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED)
                .count();
        long pendingEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.PENDING)
                .count();
        
        // Calculate average completion percentage
        Double averageCompletion = enrollments.stream()
                .mapToDouble(Enrollment::getCompletionPercentage)
                .average()
                .orElse(0.0);
        
        // Calculate completion rate (completed / total)
        Double completionRate = totalEnrollments > 0 
                ? (completedEnrollments * 100.0 / totalEnrollments) 
                : 0.0;
        
        // Calculate dropout rate (cancelled / total)
        long cancelledEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.CANCELLED)
                .count();
        Double dropoutRate = totalEnrollments > 0 
                ? (cancelledEnrollments * 100.0 / totalEnrollments) 
                : 0.0;
        
        // Revenue calculation
        Double totalRevenue = totalEnrollments > 0 
                ? formation.getPrice().doubleValue() * totalEnrollments 
                : 0.0;
        
        // Build response
        stats.put("formationId", formationId);
        stats.put("formationTitle", formation.getTitle());
        stats.put("category", formation.getCategory());
        stats.put("level", formation.getLevel());
        stats.put("instructor", formation.getInstructor() != null 
                ? formation.getInstructor().getFirstName() + " " + formation.getInstructor().getLastName() 
                : "N/A");
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("activeEnrollments", activeEnrollments);
        stats.put("completedEnrollments", completedEnrollments);
        stats.put("pendingEnrollments", pendingEnrollments);
        stats.put("cancelledEnrollments", cancelledEnrollments);
        stats.put("averageCompletion", Math.round(averageCompletion * 100.0) / 100.0);
        stats.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
        stats.put("dropoutRate", Math.round(dropoutRate * 100.0) / 100.0);
        stats.put("totalRevenue", totalRevenue);
        stats.put("status", formation.getStatus());
        stats.put("startDate", formation.getStartDate());
        stats.put("endDate", formation.getEndDate());
        
        return stats;
    }

    /**
     * Get statistics for a specific student
     */
    public Map<String, Object> getStudentStatistics(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        
        Map<String, Object> stats = new HashMap<>();
        
        // Get all enrollments for this student
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        
        // Calculate statistics
        long totalEnrollments = enrollments.size();
        long activeEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .count();
        long completedEnrollments = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED)
                .count();
        
        // Calculate average completion
        Double averageCompletion = enrollments.stream()
                .mapToDouble(Enrollment::getCompletionPercentage)
                .average()
                .orElse(0.0);
        
        // Calculate total lessons completed (using completion percentage as proxy)
        long totalLessonsCompleted = Math.round(enrollments.stream()
                .mapToDouble(Enrollment::getCompletionPercentage)
                .sum() / 100.0);
        
        // Build response
        stats.put("studentId", studentId);
        stats.put("studentName", student.getFirstName() + " " + student.getLastName());
        stats.put("email", student.getEmail());
        stats.put("joinDate", student.getCreatedAt());
        stats.put("lastActivityDate", student.getLastLogin());
        stats.put("totalEnrollments", totalEnrollments);
        stats.put("activeEnrollments", activeEnrollments);
        stats.put("completedFormations", completedEnrollments);
        stats.put("averageCompletion", Math.round(averageCompletion * 100.0) / 100.0);
        stats.put("totalLessonsCompleted", totalLessonsCompleted);
        
        // Build enrollments list with details
        List<Map<String, Object>> enrollmentsList = enrollments.stream()
                .map(enrollment -> {
                    Map<String, Object> enrollmentMap = new HashMap<>();
                    enrollmentMap.put("enrollmentId", enrollment.getEnrollmentId());
                    enrollmentMap.put("formationId", enrollment.getFormation().getFormationId());
                    enrollmentMap.put("formationTitle", enrollment.getFormation().getTitle());
                    enrollmentMap.put("progress", enrollment.getCompletionPercentage());
                    enrollmentMap.put("status", enrollment.getStatus());
                    enrollmentMap.put("enrollmentDate", enrollment.getEnrollmentDate());
                    return enrollmentMap;
                })
                .collect(Collectors.toList());
        
        stats.put("enrollments", enrollmentsList);
        stats.put("learningPace", calculateLearningPace(totalEnrollments, completedEnrollments));
        stats.put("certificatesEarned", completedEnrollments);
        
        return stats;
    }

    /**
     * Helper method to calculate average completion rate across all enrollments
     */
    private Double calculateAverageCompletionRate() {
        return enrollmentRepository.getAverageCompletionPercentage();
    }

    /**
     * Helper method to calculate total revenue
     */
    private Double calculateTotalRevenue() {
        List<Formation> allFormations = formationRepository.findAll();
        return allFormations.stream()
                .map(formation -> {
                    long enrollmentCount = enrollmentRepository.countByFormation(formation);
                    return formation.getPrice().doubleValue() * enrollmentCount;
                })
                .reduce(0.0, Double::sum);
    }

    /**
     * Helper method to determine learning pace
     */
    private String calculateLearningPace(long total, long completed) {
        if (total == 0) return "No activity";
        double rate = (double) completed / total;
        if (rate >= 0.75) return "Fast";
        if (rate >= 0.50) return "Moderate";
        if (rate >= 0.25) return "Slow";
        return "Very slow";
    }
}
