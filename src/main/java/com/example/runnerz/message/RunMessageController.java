package com.example.runnerz.message;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class RunMessageController {

    private final SendRunMessageService sendRunMessageService;
    private final ReceiveRunMessagesService receiveRunMessagesService;
    private final AnswerRunMessageService answerRunMessageService;

    public RunMessageController(
        SendRunMessageService sendRunMessageService,
        ReceiveRunMessagesService receiveRunMessagesService,
        AnswerRunMessageService answerRunMessageService
    ) {
        this.sendRunMessageService = sendRunMessageService;
        this.receiveRunMessagesService = receiveRunMessagesService;
        this.answerRunMessageService = answerRunMessageService;
    }

    @GetMapping("")
    public List<RunMessage> list(@AuthenticationPrincipal OAuth2User user) {
        return receiveRunMessagesService.listForUser(user);
    }

    @GetMapping("/unread-count")
    public int unreadCount(@AuthenticationPrincipal OAuth2User user) {
        return receiveRunMessagesService.unreadCount(user);
    }

    @PostMapping("/mark-read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@AuthenticationPrincipal OAuth2User user) {
        receiveRunMessagesService.markIncomingAsRead(user);
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("")
    public RunMessage send(
        @AuthenticationPrincipal OAuth2User user,
        @RequestBody JoinRunMessageRequest request
    ) {
        return sendRunMessageService.send(user, request);
    }

    @PostMapping("/{id:\\d+}/reply")
    public RunMessage reply(
        @AuthenticationPrincipal OAuth2User user,
        @PathVariable Integer id,
        @RequestBody RunMessageReplyRequest request
    ) {
        return answerRunMessageService.reply(user, id, request);
    }
}
