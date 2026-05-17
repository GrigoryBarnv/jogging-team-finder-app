package com.example.runnerz.security;

import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class UserProfileRepository {

    private final JdbcClient jdbcClient;

    public UserProfileRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public Optional<String> findNickname(String email) {
        return jdbcClient.sql("""
                SELECT nickname
                FROM user_profiles
                WHERE email = :email
                """)
            .param("email", email)
            .query(String.class)
            .optional();
    }

    public void saveNickname(String email, String nickname) {
        jdbcClient.sql("""
                INSERT INTO user_profiles (email, nickname)
                VALUES (:email, :nickname)
                ON CONFLICT (email)
                DO UPDATE SET nickname = EXCLUDED.nickname
                """)
            .param("email", email)
            .param("nickname", nickname)
            .update();
    }
}
