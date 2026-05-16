package com.example.runnerz;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WelcomeMessage {

    @GetMapping("/")
    public String getMessage() {
        return "Welcome to the Spring Boot Message";
    }
}
