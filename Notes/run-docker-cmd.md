This is a good starting point for learning **how to execute commands inside Docker containers**. Let’s understand it from a DevOps perspective rather than just memorizing commands.

# Docker: Running Commands Inside a Container

Think of a Docker container as a **small isolated Linux environment** running on your machine.

For example:

```text
Your Ubuntu Host
│
├── Docker Engine
│
├── Container 1
│   └── Ubuntu
│       └── bash
│
├── Container 2
│   └── Nginx
│
└── Container 3
    └── Python Application
```

There are three important concepts here:

| Method           | When it is used                                           |
| ---------------- | --------------------------------------------------------- |
| `docker run`     | Create **and start a new container**                      |
| `docker exec`    | Run a **new command inside an already-running container** |
| `docker attach`  | Connect to the **existing main process** of a container   |
| `Dockerfile RUN` | Execute commands while **building the image**             |

---

## 1. `docker run -it ubuntu bash`

This is probably the most important command to understand first.

```bash
docker run -it ubuntu bash
```

Break it down:

```text
docker
  │
  └── run
       │
       ├── -i
       ├── -t
       ├── ubuntu
       └── bash
```

### `docker run`

Creates a **new container** from an image and starts it.

If the Ubuntu image doesn't exist locally:

```text
Docker
  ↓
Check local images
  ↓
Ubuntu image missing
  ↓
Pull ubuntu image
  ↓
Create container
  ↓
Start container
```

### `-i`

Means:

```text
--interactive
```

It keeps STDIN open so you can type commands.

### `-t`

Means:

```text
--tty
```

It gives you a terminal-like interface.

Therefore:

```bash
-it
```

means:

> "Give me an interactive terminal inside this container."

### `ubuntu`

This is the image from which Docker creates the container.

### `bash`

This is the command that Docker starts inside the container.

So:

```bash
docker run -it ubuntu bash
```

essentially means:

> Create a new Ubuntu container and start an interactive Bash shell inside it.

You might see:

```bash
root@a1b2c3d4e5f6:/#
```

Now you are **inside the container**.

Try:

```bash
whoami
```

You may get:

```text
root
```

Then:

```bash
pwd
```

Output:

```text
/
```

And:

```bash
ls
```

You'll see the container's filesystem.

---

# 2. What happens when you exit?

Inside the container:

```bash
exit
```

The Bash process terminates.

Because Bash was the main process (`PID 1`) of this container, the container stops.

You can check from the host:

```bash
docker ps
```

The container won't appear because `docker ps` shows only running containers.

Instead:

```bash
docker ps -a
```

You'll see it.

For example:

```text
CONTAINER ID   IMAGE    STATUS
a1b2c3d4e5f6   ubuntu   Exited (0)
```

This leads to an important distinction:

```text
IMAGE
  ↓ docker run
CONTAINER
  ↓ start
RUNNING CONTAINER
```

---

# 3. `docker exec`

Now suppose you have a container that is already running.

Check:

```bash
docker ps
```

Example:

```text
CONTAINER ID   IMAGE    STATUS
abc123         nginx    Up 10 minutes
```

You can execute a command inside it:

```bash
docker exec abc123 ls
```

This means:

> Create a new process inside the already-running container and execute `ls`.

For an interactive shell:

```bash
docker exec -it abc123 bash
```

or, for minimal images that don't contain Bash:

```bash
docker exec -it abc123 sh
```

### Important distinction

```bash
docker run
```

creates a **new container**.

```bash
docker exec
```

does **not** create a new container.

It enters an existing running container by starting another process.

---

# 4. `docker exec` architecture

Suppose your container is running:

```text
Container
│
└── PID 1
    └── nginx
```

Now you execute:

```bash
docker exec -it container nginx -t
```

Docker creates another process:

```text
Container
│
├── PID 1
│   └── nginx
│
└── PID 25
    └── nginx -t
```

That's why `exec` is useful for:

* debugging
* inspecting files
* checking processes
* testing configuration
* running administrative commands

For example:

```bash
docker exec nginx-container ps aux
```

or:

```bash
docker exec nginx-container cat /etc/nginx/nginx.conf
```

---

# 5. `docker attach`

This is different.

Suppose you started:

```bash
docker run -it ubuntu bash
```

Bash becomes the container's main process:

```text
Container
│
└── PID 1
    └── bash
```

If you use:

```bash
docker attach <container>
```

you're connecting to that **existing PID 1 process**.

You are not creating another Bash process.

That's the key difference:

```text
docker exec
     ↓
NEW process
     ↓
inside container
```

versus:

```text
docker attach
     ↓
EXISTING PID 1
     ↓
connect to it
```

---

# 6. `exec` vs `attach`

Remember this simple analogy:

### `exec`

Imagine an office building.

You enter the building and ask:

> "Can I open another terminal and run `ls`?"

That's `exec`.

### `attach`

You connect directly to the employee who is already working at the main desk.

That's `attach`.

Technically:

|                               | `exec`     | `attach`        |
| ----------------------------- | ---------- | --------------- |
| Creates new process?          | ✅ Yes      | ❌ No            |
| Works with running container? | ✅          | ✅               |
| Connects to PID 1?            | ❌          | ✅               |
| Good for debugging?           | ✅          | Usually not     |
| Opens another shell?          | ✅          | ❌               |
| Can exiting affect container? | Usually no | Potentially yes |

---

# 7. Very important: `docker stop` vs `exit`

Suppose:

```bash
docker exec -it mycontainer bash
```

Inside:

```bash
exit
```

What happens?

```text
Bash process → terminates
Container → continues running
```

But if Bash is the main process:

```bash
docker run -it ubuntu bash
```

then:

```bash
exit
```

means:

```text
PID 1 bash → terminates
        ↓
Container → stops
```

This is a very important Docker concept.

---

# 8. Running multiple commands

You can execute:

```bash
docker exec -it mycontainer sh -c "command1 && command2 && command3"
```

For example:

```bash
docker exec -it mycontainer sh -c "echo Hello && pwd && ls"
```

Here:

```text
docker exec
     ↓
start sh
     ↓
-c
     ↓
execute the quoted command string
```

`&&` means:

> Execute the next command only if the previous command succeeds.

For example:

```bash
apt-get update && apt-get install -y curl
```

means:

```text
apt-get update
      │
      ├── success → install curl
      │
      └── failure → stop
```

This is much safer than:

```bash
apt-get update ; apt-get install -y curl
```

because `;` executes the second command regardless of whether the first succeeded.

---

# 9. Dockerfile `RUN` is different

This part of your material is particularly important.

Consider:

```dockerfile
FROM ubuntu:latest

RUN echo "geeksforgeeks"
```

Then:

```bash
docker build -t sample-image .
```

Here `RUN` is executed during **image building**.

Think:

```text
Dockerfile
    ↓
docker build
    ↓
Image
    ↓
docker run
    ↓
Container
```

So:

```dockerfile
RUN apt-get update
```

means:

> Execute this while constructing the image.

Whereas:

```bash
docker exec mycontainer apt-get update
```

means:

> Execute this inside an already-running container.

---

# 10. The most important Docker distinction

You should memorize this:

```text
Dockerfile RUN
       ↓
BUILD TIME
       ↓
IMAGE

docker run
       ↓
CREATE + START
       ↓
CONTAINER

docker exec
       ↓
RUNTIME
       ↓
NEW PROCESS INSIDE RUNNING CONTAINER

docker attach
       ↓
RUNTIME
       ↓
CONNECT TO EXISTING MAIN PROCESS
```

---

# 11. Practical DevOps example

Suppose you have an Nginx container:

```bash
docker run -d --name web nginx
```

Check it:

```bash
docker ps
```

Then enter it:

```bash
docker exec -it web bash
```

Inside:

```bash
nginx -t
```

or:

```bash
cat /etc/nginx/nginx.conf
```

or:

```bash
ls /usr/share/nginx/html
```

Exit:

```bash
exit
```

The Nginx container is still running.

```bash
docker ps
```

This is exactly the kind of workflow you'll use when troubleshooting containers in DevOps.

---

# 12. One correction to the article

The statement:

> "`docker exec` is used to install a package on the fly"

is technically possible, but **generally not a good production practice**.

For example:

```bash
docker exec -it web apt-get install curl
```

modifies the running container.

But when the container is recreated:

```text
old container
    ↓
destroyed

new container
    ↓
created from original image
    ↓
curl may be gone
```

The better approach is usually:

```dockerfile
FROM ubuntu

RUN apt-get update && \
    apt-get install -y curl
```

Then build a new image:

```bash
docker build -t my-image .
```

This makes the environment **reproducible**.

---

# Quick Revision

```text
docker run
= Create + start a new container

docker exec
= Run a NEW process inside an existing RUNNING container

docker attach
= Connect to the EXISTING main process (PID 1)

Dockerfile RUN
= Execute command while BUILDING the image
```

### Commands you should practice

```bash
docker run -it ubuntu bash

docker ps

docker ps -a

docker start <container>

docker exec -it <container> bash

docker exec <container> ls

docker exec -it <container> sh

docker attach <container>

docker stop <container>
```

**Interview question to remember:**

> **What is the difference between `docker run`, `docker exec`, and `docker attach`?**

**Topper-style answer:**
`docker run` creates and starts a new container from an image. `docker exec` starts a new process/command inside an already-running container, commonly for debugging or administration. `docker attach` connects the terminal to the container's existing main process (PID 1) rather than creating a new process.

