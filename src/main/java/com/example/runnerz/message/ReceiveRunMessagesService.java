package com.example.runnerz.message;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ReceiveRunMessagesService {

    private final RunMessageRepository runMessageRepository;

    public ReceiveRunMessagesService(RunMessageRepository runMessageRepository) {
        this.runMessageRepository = runMessageRepository;
    }

    public List<RunMessage> listForUser(OAuth2User user) {
        String email = requireEmail(user);
        return runMessageRepository.findForUser(email);
    }

    public int unreadCount(OAuth2User user) {
        String email = requireEmail(user);
        return runMessageRepository.countUnreadForUser(email);
    }

    public void markIncomingAsRead(OAuth2User user) {
        String email = requireEmail(user);
        runMessageRepository.markIncomingAsRead(email, LocalDateTime.now());
    }

    private String requireEmail(OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }

        return user.getAttribute("email").toString();
    }
}
