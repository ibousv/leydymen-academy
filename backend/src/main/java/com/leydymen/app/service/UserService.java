package com.leydymen.app.service;

import com.leydymen.app.dto.UserDTO;
import com.leydymen.app.dto.response.PaginatedResponse;
import com.leydymen.app.entity.User;
import com.leydymen.app.entity.User.UserRole;
import com.leydymen.app.entity.User.UserStatus;
import com.leydymen.app.mapper.UserMapper;
import com.leydymen.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserDTO getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
    }

    public UserDTO getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public PaginatedResponse<UserDTO> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return buildPaginatedResponse(users, pageable);
    }

    public PaginatedResponse<UserDTO> getUsersByRole(UserRole role, Pageable pageable) {
        Page<User> users = userRepository.findByRole(role, pageable);
        return buildPaginatedResponse(users, pageable);
    }

    public PaginatedResponse<UserDTO> getUsersByStatus(UserStatus status, Pageable pageable) {
        Page<User> users = userRepository.findByStatus(status, pageable);
        return buildPaginatedResponse(users, pageable);
    }

    public PaginatedResponse<UserDTO> searchUsers(String keyword, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(keyword, pageable);
        return buildPaginatedResponse(users, pageable);
    }

    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        userMapper.updateEntityFromDTO(userDTO, user);
        User updatedUser = userRepository.save(user);
        return userMapper.toDTO(updatedUser);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        userRepository.delete(user);
    }

    public void changeUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setStatus(status);
        userRepository.save(user);
    }

    public void updateLastLogin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(String username, String email, String password, String firstName, 
                           String lastName, UserRole role) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists: " + username);
        }
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists: " + email);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        return userRepository.save(user);
    }

    public long countByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    private PaginatedResponse<UserDTO> buildPaginatedResponse(Page<User> page, Pageable pageable) {
        return PaginatedResponse.<UserDTO>builder()
                .content(page.getContent().stream()
                        .map(userMapper::toDTO)
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
