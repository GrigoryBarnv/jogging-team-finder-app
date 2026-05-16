// package com.example.runnerz.run;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertTrue;

// import java.time.LocalDateTime;
// import java.time.temporal.ChronoUnit;
// import java.util.List;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;

// public class InMemoryRunRepositoryTest {

//     InMemoryRunRepository repository;

//     @BeforeEach
//     void setup() {
//         repository = new InMemoryRunRepository();

//         repository.create(new Run(
//                 1,
//                 "Monday Morning Run",
//                 LocalDateTime.now(),
//                 LocalDateTime.now().plus(30, ChronoUnit.MINUTES),
//                 3,
//                 Location.INDOOR
//         ));

//         repository.create(new Run(
//                 2,
//                 "Wednesday Evening Run",
//                 LocalDateTime.now(),
//                 LocalDateTime.now().plus(60, ChronoUnit.MINUTES),
//                 6,
//                 Location.INDOOR
//         ));
//     }

//     @Test
//     void shouldFindRunsByLocation() {
//         List<Run> runs = repository.findByLocation("INDOOR");

//         assertEquals(2, runs.size());
//         assertTrue(runs.stream().allMatch(run -> run.location() == Location.INDOOR));
//     }

//     @Test
//     void shouldFindRunById() {
//         assertTrue(repository.findById(1).isPresent());
//         assertEquals("Monday Morning Run", repository.findById(1).get().title());
//     }
// }
