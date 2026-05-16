package com.example.runnerz.run;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;

public record Run(
    @Id
    Integer id,
    @NotEmpty
    String title,
    LocalDateTime startedOn,
    LocalDateTime completedOn,
    @Positive
    Integer miles,
    Location location,
    String district,
    String userEmail,
    @Version 
    Integer version
) {

    public Run(Integer id, String title, LocalDateTime startedOn,
               LocalDateTime completedOn, Integer miles, Location location) {
        this(id, title, startedOn, completedOn, miles, location, "", "", null);
    }

    public Run(Integer id, String title, LocalDateTime startedOn,
               LocalDateTime completedOn, Integer miles, Location location,
               String district) {
        this(id, title, startedOn, completedOn, miles, location, district, "", null);
    }

    public Run(Integer id, String title, LocalDateTime startedOn,
               LocalDateTime completedOn, Integer miles, Location location,
               String district, String userEmail) {
        this(id, title, startedOn, completedOn, miles, location, district, userEmail, null);
    }

    public Run withUserEmail(String userEmail) {
        return new Run(id, title, startedOn, completedOn, miles, location, district, userEmail, version);
    }

    public Run {
        if (!completedOn.isAfter(startedOn)) {
            throw new IllegalArgumentException(
                "Completed On must be after Started On"
            );
        }
    }
}
