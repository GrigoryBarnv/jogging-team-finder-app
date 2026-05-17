package com.example.runnerz.security;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserProfileService userProfileService;

    public AuthController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    Map<String, Object> me(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return Map.of("authenticated", false);
        }

        String email = valueOrEmpty(user.getAttribute("email"));
        String nickname = userProfileService.getNickname(user);
        String googleName = valueOrEmpty(user.getAttribute("name"));
        String displayName = nickname.isBlank() ? googleName : nickname;

        return Map.of(
            "authenticated", true,
            "name", googleName,
            "nickname", nickname,
            "displayName", displayName,
            "needsNickname", nickname.isBlank(),
            "email", email,
            "picture", valueOrEmpty(user.getAttribute("picture"))
        );
    }

    @GetMapping("/display-name")
    Map<String, String> displayNameByEmail(@RequestParam String email) {
        String displayName = userProfileService.getNicknameByEmail(email);
        return Map.of("displayName", displayName);
    }

    @PutMapping("/nickname")
    Map<String, Object> setNickname(
        @AuthenticationPrincipal OAuth2User user,
        @RequestBody NicknameRequest request
    ) {
        userProfileService.saveNickname(user, request == null ? null : request.nickname());
        return me(user);
    }

    private String valueOrEmpty(Object value) {
        return value == null ? "" : value.toString();
    }
}
