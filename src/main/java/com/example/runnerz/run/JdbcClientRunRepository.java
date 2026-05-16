package com.example.runnerz.run;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.springframework.util.Assert;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JdbcClientRunRepository {

    private final JdbcClient jdbcClient;

    public JdbcClientRunRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<Run> findAll() {
        return jdbcClient.sql("""
                SELECT id,
                       title,
                       started_on,
                       completed_on,
                       miles,
                       location,
                       district,
                       user_email
                FROM runs
                ORDER BY id
                """)
            .query((rs, rowNum) -> new Run(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getTimestamp("started_on").toLocalDateTime(),
                rs.getTimestamp("completed_on").toLocalDateTime(),
                rs.getInt("miles"),
                Location.valueOf(rs.getString("location")),
                rs.getString("district"),
                rs.getString("user_email")
            ))
            .list();
    }

    public Optional<Run> findById(Integer id) {
        return jdbcClient.sql("""
                SELECT id,
                       title,
                       started_on,
                       completed_on,
                       miles,
                       location,
                       district,
                       user_email
                FROM runs
                WHERE id = :id
                """)
            .param("id", id)
            .query((rs, rowNum) -> new Run(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getTimestamp("started_on").toLocalDateTime(),
                rs.getTimestamp("completed_on").toLocalDateTime(),
                rs.getInt("miles"),
                Location.valueOf(rs.getString("location")),
                rs.getString("district"),
                rs.getString("user_email")
            ))
            .optional();
    }

    public void create(Run run) {
        Integer id = run.id() == null ? nextId() : run.id();
        var updated = jdbcClient.sql("""
                INSERT INTO runs (id, title, started_on, completed_on, miles, location, district, user_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """)
            .params(List.of(
                id,
                run.title(),
                run.startedOn(),
                run.completedOn(),
                run.miles(),
                run.location().toString(),
                run.district() == null ? "" : run.district(),
                run.userEmail() == null ? "" : run.userEmail()))
            .update();

        Assert.state(updated == 1, "Failed to create run " + run.title());
    }

    public void update(Run run, Integer id) {
        var updated = jdbcClient.sql("""
                UPDATE runs
                SET title = ?,
                    started_on = ?,
                    completed_on = ?,
                    miles = ?,
                    location = ?,
                    district = ?,
                    user_email = ?
                WHERE id = ?
                """)
            .params(List.of(
                run.title(),
                run.startedOn(),
                run.completedOn(),
                run.miles(),
                run.location().toString(),
                run.district() == null ? "" : run.district(),
                run.userEmail() == null ? "" : run.userEmail(),
                id))
            .update();

        Assert.state(updated == 1, "Failed to update run " + run.title());
    }

    public void delete(Integer id) {
        var updated = jdbcClient.sql("DELETE FROM runs WHERE id = :id")
            .param("id", id)
            .update();

        Assert.state(updated == 1, "Failed to delete run " + id);
    }

    public int count() {
        Integer count = jdbcClient.sql("SELECT COUNT(*) FROM runs")
            .query(Integer.class)
            .single();
        return count == null ? 0 : count;
    }

    public void saveAll(List<Run> runs) {
        runs.forEach(this::create);
    }

    public List<Run> findByLocation(String location) {
        return jdbcClient.sql("""
                SELECT id,
                       title,
                       started_on,
                       completed_on,
                       miles,
                       location,
                       district,
                       user_email
                FROM runs
                WHERE location = :location
                ORDER BY id
                """)
            .param("location", location)
            .query((rs, rowNum) -> new Run(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getTimestamp("started_on").toLocalDateTime(),
                rs.getTimestamp("completed_on").toLocalDateTime(),
                rs.getInt("miles"),
                Location.valueOf(rs.getString("location")),
                rs.getString("district"),
                rs.getString("user_email")
            ))
            .list();
    }

    public List<Run> findByUserEmail(String userEmail) {
        return jdbcClient.sql("""
                SELECT id,
                       title,
                       started_on,
                       completed_on,
                       miles,
                       location,
                       district,
                       user_email
                FROM runs
                WHERE user_email = :userEmail
                ORDER BY id
                """)
            .param("userEmail", userEmail)
            .query((rs, rowNum) -> new Run(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getTimestamp("started_on").toLocalDateTime(),
                rs.getTimestamp("completed_on").toLocalDateTime(),
                rs.getInt("miles"),
                Location.valueOf(rs.getString("location")),
                rs.getString("district"),
                rs.getString("user_email")
            ))
            .list();
    }

    public List<Run> findFutureRuns(LocalDateTime now, String district, String query) {
        String normalizedDistrict = district == null || district.isBlank() ? "ALL" : district;
        String normalizedQuery = query == null || query.isBlank() ? "" : query.trim().toLowerCase();

        StringBuilder sql = new StringBuilder("""
                SELECT id,
                       title,
                       started_on,
                       completed_on,
                       miles,
                       location,
                       district,
                       user_email
                FROM runs
                WHERE started_on > :now
                """);

        if (!"ALL".equals(normalizedDistrict)) {
            sql.append("""
                  AND COALESCE(district, '') = :district
                    """);
        }

        if (!normalizedQuery.isBlank()) {
            sql.append("""
                  AND (
                      LOWER(COALESCE(title, '')) LIKE :query
                      OR LOWER(COALESCE(district, '')) LIKE :query
                  )
                    """);
        }

        sql.append("""
                ORDER BY started_on ASC
                """);

        var statement = jdbcClient.sql(sql.toString())
            .param("now", now);

        if (!"ALL".equals(normalizedDistrict)) {
            statement = statement.param("district", normalizedDistrict);
        }

        if (!normalizedQuery.isBlank()) {
            statement = statement.param("query", "%" + normalizedQuery + "%");
        }

        return statement
            .query((rs, rowNum) -> new Run(
                rs.getInt("id"),
                rs.getString("title"),
                rs.getTimestamp("started_on").toLocalDateTime(),
                rs.getTimestamp("completed_on").toLocalDateTime(),
                rs.getInt("miles"),
                Location.valueOf(rs.getString("location")),
                rs.getString("district"),
                rs.getString("user_email")
            ))
            .list();
    }

    private Integer nextId() {
        Integer id = jdbcClient.sql("SELECT COALESCE(MAX(id), 0) + 1 FROM runs")
            .query(Integer.class)
            .single();
        return id == null ? 1 : id;
    }

    public void seedData() {
        if (count() > 0) {
            return;
        }

        create(new Run(
            1,
            "Monday Morning Run",
            LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS),
            LocalDateTime.now().plus(30, ChronoUnit.MINUTES).truncatedTo(ChronoUnit.SECONDS),
            3,
            Location.INDOOR
        ));

        create(new Run(
            2,
            "Wednesday Evening Run",
            LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS),
            LocalDateTime.now().plus(60, ChronoUnit.MINUTES).truncatedTo(ChronoUnit.SECONDS),
            6,
            Location.OUTDOOR
        ));
    }
}
