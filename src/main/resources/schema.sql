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

CREATE TABLE IF NOT EXISTS user_profiles (
    email VARCHAR(250) PRIMARY KEY,
    nickname VARCHAR(80) NOT NULL
);

CREATE TABLE IF NOT EXISTS run_messages (
    id INT NOT NULL,
    run_id INT NOT NULL,
    run_title VARCHAR(250) NOT NULL,
    sender_email VARCHAR(250) NOT NULL,
    sender_name VARCHAR(80) NOT NULL,
    recipient_email VARCHAR(250) NOT NULL,
    recipient_name VARCHAR(80) NOT NULL,
    message_text VARCHAR(1000) NOT NULL,
    reply_text VARCHAR(1000),
    created_at TIMESTAMP NOT NULL,
    replied_at TIMESTAMP,
    read_at TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE run_messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;
