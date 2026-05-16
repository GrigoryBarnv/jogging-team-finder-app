package com.example.runnerz.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.test.web.client.MockRestServiceServer;

class UserRestClientTest {

    UserRestClient client;
    MockRestServiceServer server;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
            .baseUrl("https://jsonplaceholder.typicode.com/");

        server = MockRestServiceServer.bindTo(builder).build();
        client = new UserRestClient(builder);
    }

    @Test
    void shouldFindAllUsers() {
        server.expect(requestTo("https://jsonplaceholder.typicode.com/users"))
            .andRespond(withSuccess("""
                [
                  {
                    "id": 1,
                    "name": "Leanne Graham",
                    "username": "Bret",
                    "email": "Sincere@april.biz",
                    "address": {
                      "street": "Kulas Light",
                      "suite": "Apt. 556",
                      "city": "Gwenborough",
                      "zipcode": "92998-3874",
                      "geo": {
                        "lat": "-37.3159",
                        "lng": "81.1496"
                      }
                    },
                    "phone": "1-770-736-8031 x56442",
                    "website": "hildegard.org",
                    "company": {
                      "name": "Romaguera-Crona",
                      "catchPhrase": "Multi-layered client-server neural-net",
                      "bs": "harness real-time e-markets"
                    }
                  }
                ]
                """, MediaType.APPLICATION_JSON));

        List<User> users = client.findAll();

        assertEquals(1, users.size());
        assertEquals("Leanne Graham", users.getFirst().name());
        assertNotNull(users.getFirst().address());
    }

    @Test
    void shouldFindUserById() {
        server.expect(requestTo("https://jsonplaceholder.typicode.com/users/1"))
            .andRespond(withSuccess("""
                {
                  "id": 1,
                  "name": "Leanne Graham",
                  "username": "Bret",
                  "email": "Sincere@april.biz",
                  "address": {
                    "street": "Kulas Light",
                    "suite": "Apt. 556",
                    "city": "Gwenborough",
                    "zipcode": "92998-3874",
                    "geo": {
                      "lat": "-37.3159",
                      "lng": "81.1496"
                    }
                  },
                  "phone": "1-770-736-8031 x56442",
                  "website": "hildegard.org",
                  "company": {
                    "name": "Romaguera-Crona",
                    "catchPhrase": "Multi-layered client-server neural-net",
                    "bs": "harness real-time e-markets"
                  }
                }
                """, MediaType.APPLICATION_JSON));

        User user = client.findById(1);

        assertEquals(1, user.id());
        assertEquals("Bret", user.username());
    }
}
