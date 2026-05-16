package com.example.runnerz;

import com.example.runnerz.user.UserHttpClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	UserHttpClient userHttpClient() {
		RestClient restClient = RestClient.create("https://jsonplaceholder.typicode.com");
		HttpServiceProxyFactory factory =
			HttpServiceProxyFactory.builderFor(RestClientAdapter.create(restClient)).build();
		return factory.createClient(UserHttpClient.class);
	}

	@Bean
	ObjectMapper objectMapper() {
		return new ObjectMapper().registerModule(new JavaTimeModule());
	}

	@Bean
	RestClient.Builder restClientBuilder() {
		return RestClient.builder();
	}

}
