// package com.example.runnerz.run;

// import static org.hamcrest.Matchers.is;
// import static org.mockito.Mockito.mock;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// import java.time.LocalDateTime;
// import java.time.temporal.ChronoUnit;
// import java.util.ArrayList;
// import java.util.List;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.setup.MockMvcBuilders;

// class RunControllerTest {

//     MockMvc mvc;
//     JdbcClientRunRepository repository;
//     List<Run> runs = new ArrayList<>();

//     @BeforeEach
//     void setUp() {
//         repository = mock(JdbcClientRunRepository.class);
//         mvc = MockMvcBuilders.standaloneSetup(new RunController(repository)).build();

//         runs.clear();
//         runs.add(new Run(
//                 1,
//                 "Monday Morning Run",
//                 LocalDateTime.now(),
//                 LocalDateTime.now().plus(30, ChronoUnit.MINUTES),
//                 3,
//                 Location.INDOOR,
//                 null
//         ));
//     }

//     @Test
//     void shouldFindAllRuns() throws Exception {
//         when(repository.findAll()).thenReturn(runs);

//         mvc.perform(get("/api/runs"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.size()", is(runs.size())));
//     }
// }
