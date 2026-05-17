package com.example.runnerz.run;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

@RestController
@RequestMapping("/api/runs")
public class RunController {

    private final JdbcClientRunRepository runRepository;
    private final RunDeletionService runDeletionService;
    private final RunUpdateService runUpdateService;

    public RunController(
        JdbcClientRunRepository runRepository,
        RunDeletionService runDeletionService,
        RunUpdateService runUpdateService
    ) {
        this.runRepository = runRepository;
        this.runDeletionService = runDeletionService;
        this.runUpdateService = runUpdateService;
    }

    @GetMapping("")
    public List<Run> findAll() {
        List<Run> runs = new ArrayList<>();
        runRepository.findAll().forEach(runs::add);
        return runs;
    }

    @GetMapping("/future")
    public List<Run> findFutureRuns(
            @RequestParam(defaultValue = "ALL") String district,
            @RequestParam(required = false) String q) {
        return runRepository.findFutureRuns(LocalDateTime.now(), district, q);
    }

    @GetMapping("/me")
    public List<Run> findMine(@AuthenticationPrincipal OAuth2User user) {
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        return runRepository.findByUserEmail(user.getAttribute("email"));
    }

    @GetMapping("{id:\\d+}")
    Run findById(@PathVariable Integer id) {
        Optional<Run> run = runRepository.findById(id);
        if (run.isEmpty()) {
            throw new RunNotFoundException(id);
        }
        return run.get();
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("")
    void create(@RequestBody Run run, @AuthenticationPrincipal OAuth2User user) {
        if (run.id() != null && runRepository.findById(run.id()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Run already exists");
        }
        if (user == null || user.getAttribute("email") == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        runRepository.create(run.withUserEmail(user.getAttribute("email")));
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PutMapping("{id:\\d+}")
    void update(@RequestBody Run run, @PathVariable Integer id, @AuthenticationPrincipal OAuth2User user) {
        runUpdateService.update(run, id, user);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("{id:\\d+}")
    void delete(@PathVariable Integer id, @AuthenticationPrincipal OAuth2User user) {
        runDeletionService.delete(id, user);
    }

    @GetMapping("/location/{location}")
    List<Run> findByLocation(@PathVariable String location) {
        return runRepository.findByLocation(location);
    }
}
