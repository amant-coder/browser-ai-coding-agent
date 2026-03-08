package com.browserai.agent.service;

import com.browserai.agent.model.User;
import com.browserai.agent.model.UserRole;
import com.browserai.agent.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String name, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        String hash = passwordEncoder.encode(rawPassword);
        User user = new User(email, name, hash);
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()));
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /** Provision or update a user from an OAuth provider. */
    public User provisionOAuthUser(String email, String name, String avatarUrl) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User(email, name, null);
            user.setAvatarUrl(avatarUrl);
            user.setRole(UserRole.FREE);
            return userRepository.save(user);
        });
    }

    public java.util.List<User> findAll() {
        return userRepository.findAll();
    }
}
