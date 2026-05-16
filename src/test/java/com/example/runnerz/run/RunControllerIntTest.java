// package com.example.runnerz.run;

// import static org.hamcrest.Matchers.greaterThanOrEqualTo;
// import static org.hamcrest.Matchers.is;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// import com.example.runnerz.user.User;
// import com.example.runnerz.user.UserHttpClient;
// import java.util.List;
// import org.junit.jupiter.api.Test;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.boot.test.context.TestConfiguration;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Import;
// import org.springframework.test.context.TestPropertySource;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.beans.factory.annotation.Autowired;

// @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
// @Import(RunControllerIntTest.TestConfig.class)
// @TestPropertySource(properties = {
//     "spring.datasource.url=jdbc:postgresql://localhost:5432/runnerz",
//     "spring.datasource.driverClassName=org.postgresql.Driver",
//     "spring.datasource.username=das",
//     "spring.datasource.password=password",
//     "spring.sql.init.mode=always",
//     "spring.sql.init.schema-locations=classpath:schema.sql",
//     "spring.sql.init.data-locations=optional:classpath:no-data.sql",
// })
// class RunControllerIntTest {

//     @Autowired
//     MockMvc mvc;

//     @Test
//     void shouldReturnAllRuns() throws Exception {
//         mvc.perform(get("/api/runs"))
//             .andExpect(status().isOk())
//             .andExpect(jsonPath("$.size()", greaterThanOrEqualTo(1)));
//     }

//     @Test
//     void shouldReturnRunsByLocation() throws Exception {
//         mvc.perform(get("/api/runs/location/INDOOR"))
//             .andExpect(status().isOk())
//             .andExpect(jsonPath("$[0].location", is("INDOOR")));
//     }

//     @TestConfiguration
//     static class TestConfig {
//         @Bean
//         UserHttpClient userHttpClient() {
//             return new UserHttpClient() {
//                 @Override
//                 public List<User> findAll() {
//                     return List.of();
//                 }

//                 @Override
//                 public User findById(Integer id) {
//                     return null;
//                 }
//             };
//         }
//     }
// }
