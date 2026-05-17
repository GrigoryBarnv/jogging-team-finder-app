# RunTogether 🏃‍♂️🏃‍♀️

> Event-driven social running platform for finding running partners nearby.

RunTogether is a backend-focused microservices application that helps runners discover, join, and organize social running sessions.

Instead of running alone, users can create public running sessions, discover nearby runners with similar pace and distance preferences, and join scheduled runs in real time.

The project focuses heavily on:

* distributed systems,
* event-driven architecture,
* scalable backend design,
* geospatial search,
* asynchronous communication.

---

# 🚀 Features (Phase 1 MVP)

## Authentication

* JWT-based authentication
* User registration/login
* Role-based access

## Run Sessions

* Create running sessions
* Join running sessions
* Cancel running sessions
* Search nearby runs

## User Profiles

* Preferred pace
* Preferred distance
* Skill level
* Bio/profile info

## Discovery

* Find nearby running sessions
* Filter by:

  * location
  * pace
  * distance
  * time

## Notifications

* Run confirmations
* Join notifications
* Cancellation notifications

---

# 🧠 Core Idea

Most runners train alone.

RunTogether solves this by creating a social platform where runners can:

* find compatible running partners,
* discover local group runs,
* stay motivated through accountability,
* build consistent running habits.

Think:

```text
BlaBlaCar / Meetup for runners
```

---

# 🏗️ Architecture

The project follows a microservices + event-driven architecture.

```text
Frontend / Client
        ↓
API Gateway
        ↓
------------------------------------------------
| Auth Service                                 |
| Run Session Service                          |
| Notification Service                         |
| Analytics Service (future phase)             |
------------------------------------------------
        ↓
Kafka Event Bus
        ↓
PostgreSQL + Redis
```

---

# ⚙️ Services

## 🔐 Auth Service

Handles:

* registration
* login
* JWT authentication
* user profiles

### Responsibilities

* user management
* token generation
* authorization

---

## 🏃 Run Session Service

Core business logic of the platform.

Handles:

* creating run sessions
* joining sessions
* cancelling sessions
* searching nearby runs

### Main Entity

```java
RunSession {
    id
    hostUserId
    title
    description
    startLocation
    distanceKm
    targetPace
    startTime
    maxParticipants
    difficulty
    status
}
```

### Participant Entity

```java
RunParticipant {
    runSessionId
    userId
    joinedAt
}
```

---

## 🔔 Notification Service

Consumes Kafka events and sends:

* confirmations
* reminders
* cancellations
* activity updates

### Example Events

```text
RUN_CREATED
USER_JOINED_RUN
RUN_CANCELLED
```

---

## 📊 Analytics Service (Future Phase)

Tracks:

* platform activity
* popular routes
* active runners
* trends
* engagement statistics

---

# 📨 Kafka Event Flow

The platform uses Kafka for asynchronous communication between services.

Example:

```text
USER_JOINED_RUN
        ↓
Notification Service
        ↓
Send confirmation notification
```

Other event examples:

```text
RUN_CREATED
USER_JOINED_RUN
RUN_CANCELLED
RUN_REMINDER
```

This architecture allows:

* loose coupling,
* scalability,
* async processing,
* extensibility.

---

# 🗄️ PostgreSQL Usage

PostgreSQL is used as the primary persistent database.

Stores:

* users
* running sessions
* participants
* profiles

Future versions may integrate:

* PostGIS for geospatial queries.

---

# ⚡ Redis Usage

Redis is used for:

* nearby session caching
* trending runs
* active users
* performance optimization

---

# 🐳 Docker Infrastructure

The entire platform runs using Docker Compose.

```yaml
services:
  postgres:
  kafka:
  zookeeper:
  redis:
  auth-service:
  run-session-service:
  notification-service:
```

---

# 📂 Current Project Structure

```text
run/
  Run.java
  RunController
  RunRepository
  RunService
  RunDto
  Location
```

The project already follows proper backend layering:

* entities
* repositories
* services
* controllers
* DTOs

The next step is evolving:

```text
Run
```

into:

```text
RunSession
```

to support social and discoverable running events.

---

# 🛠️ Tech Stack

| Technology     | Purpose                      |
| -------------- | ---------------------------- |
| Java           | Backend language             |
| Spring Boot    | Microservices framework      |
| PostgreSQL     | Persistent storage           |
| Kafka          | Event-driven messaging       |
| Redis          | Caching                      |
| Docker Compose | Infrastructure orchestration |
| JWT            | Authentication               |
| Maven          | Dependency management        |

---

# 📌 Planned Features

## Phase 2

* live chat
* friend system
* activity feed
* group runs
* recommendations

## Phase 3

* GPS tracking
* PostGIS integration
* AI-based runner matching
* wearable integrations
* live location sharing

---

# 🎯 Project Goals

This project was created to explore:

* distributed systems,
* scalable backend architecture,
* event-driven microservices,
* real-world asynchronous workflows,
* geospatial and social applications.

---

# ▶️ Running Locally

```bash
docker compose up --build
```

---

# 📖 API Examples

## Create Run Session

```http
POST /runs
```

## Join Run

```http
POST /runs/{id}/join
```

## Search Nearby Runs

```http
GET /runs/nearby
```

---

# 👤 Author

Backend engineering project focused on:

* scalable architecture,
* distributed systems,
* event-driven backend development.



# Starting 


* Start the backend auth with google + java springboot 
        cd C:\Users\grigo\projekt_ordner\runnerz\runnerz
        .\start-oauth-backend.ps1                    

*start frontend React at 5173
        npm run dev


*start backend java at 8080
        mnv 


*start docker compose yaml with sql database
        docker compose -f .\target\compose.yaml up -d postgres 




#TODO 


Start **without Kafka first**, unless your teacher/project specifically requires Kafka right now.

For your current system, the best order is:

```text
1. Make the normal feature work
2. Send email directly from Spring Boot
3. Then move the email sending behind Kafka
```

So first build:

```text
React
  ↓
Spring Boot
  ↓
MySQL
  ↓
Email sender
```

Example:

```text
User joins run
  ↓
Backend saves participant in MySQL
  ↓
Backend sends email
  ↓
Return success
```

Once that works, upgrade to:

```text
User joins run
  ↓
Backend saves participant in MySQL
  ↓
Backend publishes USER_JOINED_RUN to Kafka
  ↓
Notification Service consumes event
  ↓
Notification Service sends email
```

Why start without Kafka?

Because Kafka adds many extra things:

```text
Kafka broker
topics
producers
consumers
message serialization
consumer groups
retry handling
duplicate message handling
dead-letter topics
Docker/network config
```

If your join/leave/cancel logic is not already solid, Kafka will make debugging much harder.

The clean approach is:

```text
Phase 1: Build core app
- create run
- join run
- leave run
- cancel run
- store everything in MySQL

Phase 2: Add email directly
- send confirmation email
- send leave notification
- send cancellation email

Phase 3: Add Kafka
- publish USER_JOINED_RUN
- publish USER_LEFT_RUN
- publish RUN_CANCELLED
- consume events in Notification Service
```

So the answer is:

**For learning and building safely: start without Kafka.**
**For final scalable architecture: move notifications to Kafka later.**

A good middle step is to write your code as if Kafka might come later:

```java
notificationService.notifyUserJoinedRun(run, user);
```

At first, that method sends email directly.

Later, you change the inside of that method to publish a Kafka event instead.

So your controller/service logic stays mostly the same.

› Implement {feature}

  gpt-5.4-mini default · ~\projekt_ordner\runnerz\runnerz

  Token usage: total=1.540.716 input=1.356.946 (+ 34.577.152 cached) output=183.770 (reasoning 92.447)
To continue this session, run codex resume 019e36ac-0996-7d52-8767-7ee41c6b75a8


 docker start runnerz-postgres

 C:\Users\grigo\projekt_ordner\runnerz\runnerz\frontend> npm run dev

 C:\Users\grigo\projekt_ordner\runnerz\runnerz>         .\start-oauth-backend.ps1    