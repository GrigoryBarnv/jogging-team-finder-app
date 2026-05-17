package com.example.runnerz.run;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class RunDeletionService {

    private final JdbcClientRunRepository runRepository;
    private final RunOwnershipService runOwnershipService;

    public RunDeletionService(JdbcClientRunRepository runRepository, RunOwnershipService runOwnershipService) {
        this.runRepository = runRepository;
        this.runOwnershipService = runOwnershipService;
    }

    public void delete(Integer id, OAuth2User user) {
        Run existingRun = runRepository.findById(id)
            .orElseThrow(() -> new RunNotFoundException(id));

        runOwnershipService.assertCanModify(existingRun, user);
        runRepository.delete(id);
    }
}
