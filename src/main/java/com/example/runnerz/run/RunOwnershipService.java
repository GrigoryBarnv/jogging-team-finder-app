package com.example.runnerz.run;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RunOwnershipService {

    public void assertCanModify(Run run, OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        String email = user.getAttribute("email");
        if (run.userEmail() == null || run.userEmail().isBlank() || !email.equals(run.userEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own runs");
        }
    }
}
