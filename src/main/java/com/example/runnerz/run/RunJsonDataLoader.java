package com.example.runnerz.run;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class RunJsonDataLoader implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(RunJsonDataLoader.class);

    private final JdbcClientRunRepository runRepository;
    private final ObjectMapper objectMapper;

    public RunJsonDataLoader(JdbcClientRunRepository runRepository,
                             ObjectMapper objectMapper) {
        this.runRepository = runRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {

        if (runRepository.count() == 0) {

            try (InputStream inputStream =
                         TypeReference.class.getResourceAsStream("/data/runs.json")) {

                Runs allRuns =
                        objectMapper.readValue(inputStream, Runs.class);

                log.info("Reading {} runs from JSON data and saving to in-memory collection.",
                        allRuns.runs().size());

                runRepository.saveAll(allRuns.runs());

            } catch (IOException e) {

                throw new RuntimeException("Failed to read JSON data", e);
            }

        } else {

            log.info("Not loading Runs from JSON data because the collection contains data.");
        }
    }
}
