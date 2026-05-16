CREATE TABLE IF NOT EXISTS runs (
    id INT NOT NULL,
    title VARCHAR(250) NOT NULL,
    started_on TIMESTAMP NOT NULL,
    completed_on TIMESTAMP NOT NULL,
    miles INT NOT NULL,
    location VARCHAR(10) NOT NULL,
    district VARCHAR(80),
    user_email VARCHAR(250),
    PRIMARY KEY (id),
    version INT
);

ALTER TABLE runs ADD COLUMN IF NOT EXISTS district VARCHAR(80);
ALTER TABLE runs ADD COLUMN IF NOT EXISTS user_email VARCHAR(250);
