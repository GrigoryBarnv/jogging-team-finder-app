package com.example.runnerz.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public String getDisplayName(OAuth2User user) {
        String nickname = getNickname(user);
        if (!nickname.isBlank()) {
            return nickname;
        }

        return valueOrEmpty(user == null ? null : user.getAttribute("name"));
    }

    public String getDisplayNameByEmail(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }

        return getNicknameByEmail(email);
    }

    public String getNicknameByEmail(String email) {
        if (email == null || email.isBlank()) {
            return "";
        }

        return userProfileRepository.findNickname(email).orElse("");
    }

    public String getNickname(OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            return "";
        }

        return userProfileRepository.findNickname(user.getAttribute("email").toString()).orElse("");
    }

    public boolean needsNickname(OAuth2User user) {
        return getNickname(user).isBlank();
    }

    public void saveNickname(OAuth2User user, String nickname) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        String normalized = nickname == null ? "" : nickname.trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nickname is required");
        }

        if (normalized.length() > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nickname must be 80 characters or fewer");
        }

        userProfileRepository.saveNickname(user.getAttribute("email").toString(), normalized);
    }

    private String valueOrEmpty(Object value) {
        return value == null ? "" : value.toString();
    }
}
