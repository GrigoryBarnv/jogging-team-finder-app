package com.example.runnerz.security;

import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    Map<String, Object> me(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            return Map.of("authenticated", false);
        }

        return Map.of(
            "authenticated", true,
            "name", valueOrEmpty(user.getAttribute("name")),
            "email", valueOrEmpty(user.getAttribute("email")),
            "picture", valueOrEmpty(user.getAttribute("picture"))
        );
    }

    private String valueOrEmpty(Object value) {
        return value == null ? "" : value.toString();
    }
}
