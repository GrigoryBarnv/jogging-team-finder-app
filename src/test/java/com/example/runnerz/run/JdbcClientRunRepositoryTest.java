// package com.example.runnerz.run;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertTrue;

// import java.time.LocalDateTime;
// import java.time.temporal.ChronoUnit;
// import java.util.List;
// import javax.sql.DataSource;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.springframework.jdbc.core.simple.JdbcClient;

// class JdbcClientRunRepositoryTest {

//     JdbcClientRunRepository repository;

//     @BeforeEach
//     void setup() {
//         JdbcClient jdbcClient = JdbcClient.create(dataSource);
//         repository = new JdbcClientRunRepository(jdbcClient);

//         jdbcClient.sql("DROP TABLE IF EXISTS runs").update();
//         jdbcClient.sql("""
//                 CREATE TABLE runs (
//                     id INT NOT NULL,
//                     title VARCHAR(250) NOT NULL,
//                     started_on TIMESTAMP NOT NULL,
//                     completed_on TIMESTAMP NOT NULL,
//                     miles INT NOT NULL,
//                     location VARCHAR(10) NOT NULL,
//                     version INT,
//                     PRIMARY KEY (id)
//                 )
//                 """).update();

//         repository.create(new Run(
//             1,
//             "Morning Run",
//             LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS),
//             LocalDateTime.now().plus(30, ChronoUnit.MINUTES).truncatedTo(ChronoUnit.SECONDS),
//             3,
//             Location.INDOOR
//         ));

//         repository.create(new Run(
//             2,
//             "Evening Run",
//             LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS),
//             LocalDateTime.now().plus(45, ChronoUnit.MINUTES).truncatedTo(ChronoUnit.SECONDS),
//             5,
//             Location.OUTDOOR
//         ));
//     }

//     @Test
//     void shouldFindRunById() {
//         assertTrue(repository.findById(1).isPresent());
//         assertEquals("Morning Run", repository.findById(1).get().title());
//     }

//     @Test
//     void shouldFindRunsByLocation() {
//         List<Run> runs = repository.findByLocation("INDOOR");

//         assertEquals(1, runs.size());
//         assertEquals("Morning Run", runs.getFirst().title());
//     }
// }
