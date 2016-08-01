hydra-web-service
==============
[![Build Status](https://travis-ci.org/usgs/hydra-web-service.svg?branch=master)](https://travis-ci.org/usgs/hydra-web-service)

Web service for information from Hydra backend.


Using the Generated Project
---------------------------

## Getting Started
- run `npm install` to install application development dependencies
    - The application will prompt you for configuration information,
      and create a file named `src/conf/config.json` in the project.
- run `npm run dev` from the install directory


## Docker

### Building an image

- From root of project, run:
    ```
    docker build -t usgs/hydra-web-service:latest .
    ```

### Running a container

- Start the container using the image tag
    ```
    docker run --name hydra-web-service -d -p 8000:8000 usgs/hydra-web-service:latest
    ```

- Configure started container

    - Connect to running container on terminal
    ```
    docker exec -it hydra-web-service /bin/bash
    ```

    - Run pre-install to configure application
    ```
    src/lib/pre-install
    ```

    - Exit the container
    ```
    exit
    ```

- Restart the container to load the updated configuration
  ```
  docker stop hydra-web-service
  docker start hydra-web-service
  ```

- Connect to running container in browser
  ```
  http://localhost:8000/ws/hydra/
  ```
