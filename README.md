# Docker Demo - Node.js Application

A simple Node.js HTTP server application containerized with Docker. This project demonstrates basic Docker concepts including image creation, container running, and port mapping.

## Project Overview

This is a minimal Node.js web server that listens on port 3000 and responds with a greeting message. It's designed to showcase Docker fundamentals in a straightforward way.

## Prerequisites

- Docker installed on your system ([Install Docker](https://docs.docker.com/get-docker/))
- Node.js 18 or higher (for local development without Docker)

## Application Details

The application is a simple HTTP server built with Node.js's core `http` module:
- **Server Port**: 3000
- **Response**: "Hello Vishal from Docker server"

## Docker Setup

### Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

**Breakdown:**
- `FROM node:18` - Uses the official Node.js image version 18
- `WORKDIR /app` - Sets the working directory inside the container
- `COPY . .` - Copies all project files to the container
- `EXPOSE 3000` - Exposes port 3000 for external access
- `CMD ["node", "app.js"]` - Runs the application when the container starts

## Getting Started

### Build the Docker Image

```bash
docker build -t docker-demo-js-app .
```

### Run the Container

```bash
docker run -p 3000:3000 docker-demo-js-app
```

**Flags:**
- `-p 3000:3000` - Maps port 3000 from container to your local machine

### Access the Application

Once the container is running, visit:
```
http://localhost:3000
```

You should see: `Hello Vishal from Docker server`

## Running Without Docker

If you want to run the application locally without Docker:

```bash
# Install Node.js (if not already installed)
# Then run:
node app.js
```

Visit `http://localhost:3000` in your browser.

## Common Docker Commands

- **View running containers:**
  ```bash
  docker ps
  ```

- **View all images:**
  ```bash
  docker images
  ```

- **Stop a running container:**
  ```bash
  docker stop <container_id>
  ```

- **Remove an image:**
  ```bash
  docker rmi docker-demo-js-app
  ```

- **Run with a custom name:**
  ```bash
  docker run -p 3000:3000 --name my-js-server docker-demo-js-app
  ```

## Project Structure

```
docker-demo-js-app/
├── app.js              # Main application file
├── Dockerfile          # Docker configuration
└── README.md           # This file
```

## Troubleshooting

**Port already in use?**
```bash
docker run -p 8080:3000 docker-demo-js-app
```
Then visit `http://localhost:8080`

**Can't connect to container?**
- Ensure the container is running: `docker ps`
- Check logs: `docker logs <container_id>`
- Verify port mapping: `docker port <container_id>`

## Learning Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Official Documentation](https://nodejs.org/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

## License

This is a demo project for learning purposes.
