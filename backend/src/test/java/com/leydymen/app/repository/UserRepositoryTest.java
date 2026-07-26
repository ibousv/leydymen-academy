package com.leydymen.app.repository;

import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.entity.User.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("encoded_password")
                .firstName("Test")
                .lastName("User")
                .role(UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void testFindByUsername() {
        User savedUser = userRepository.save(testUser);

        Optional<User> foundUser = userRepository.findByUsername("testuser");

        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getUserId(), foundUser.get().getUserId());
        assertEquals("testuser", foundUser.get().getUsername());
    }

    @Test
    void testFindByUsername_NotFound() {
        Optional<User> foundUser = userRepository.findByUsername("nonexistent");

        assertFalse(foundUser.isPresent());
    }

    @Test
    void testFindByEmail() {
        User savedUser = userRepository.save(testUser);

        Optional<User> foundUser = userRepository.findByEmail("test@example.com");

        assertTrue(foundUser.isPresent());
        assertEquals(savedUser.getUserId(), foundUser.get().getUserId());
    }

    @Test
    void testExistsByUsername() {
        userRepository.save(testUser);

        assertTrue(userRepository.existsByUsername("testuser"));
        assertFalse(userRepository.existsByUsername("nonexistent"));
    }

    @Test
    void testExistsByEmail() {
        userRepository.save(testUser);

        assertTrue(userRepository.existsByEmail("test@example.com"));
        assertFalse(userRepository.existsByEmail("nonexistent@example.com"));
    }

    @Test
    void testFindByRole() {
        userRepository.save(testUser);

        var students = userRepository.findByRole(UserRole.STUDENT, org.springframework.data.domain.PageRequest.of(0, 10));

        assertFalse(students.isEmpty());
        assertTrue(students.getContent().stream()
                .allMatch(u -> u.getRole() == UserRole.STUDENT));
    }

    @Test
    void testFindByStatus() {
        userRepository.save(testUser);

        var activeUsers = userRepository.findByStatus(UserStatus.ACTIVE, org.springframework.data.domain.PageRequest.of(0, 10));

        assertFalse(activeUsers.isEmpty());
        assertTrue(activeUsers.getContent().stream()
                .allMatch(u -> u.getStatus() == UserStatus.ACTIVE));
    }

    @Test
    void testCountByRole() {
        userRepository.save(testUser);

        long studentCount = userRepository.countByRole(UserRole.STUDENT);

        assertTrue(studentCount > 0);
    }

    @Test
    void testSaveAndRetrieve() {
        User savedUser = userRepository.save(testUser);

        assertNotNull(savedUser.getUserId());
        assertEquals("testuser", savedUser.getUsername());
        assertEquals(UserRole.STUDENT, savedUser.getRole());
    }

    @Test
    void testUpdate() {
        User savedUser = userRepository.save(testUser);
        savedUser.setFirstName("Updated");
        User updatedUser = userRepository.save(savedUser);

        assertEquals("Updated", updatedUser.getFirstName());
    }

    @Test
    void testDelete() {
        User savedUser = userRepository.save(testUser);
        userRepository.delete(savedUser);

        Optional<User> deletedUser = userRepository.findById(savedUser.getUserId());

        assertFalse(deletedUser.isPresent());
    }
}
