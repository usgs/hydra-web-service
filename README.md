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
    docker run \
        --name hydra-web-service \
        -d \
        -p 8000:8000 \
        -e DB_DSN=host/sid \
        -e DB_USER=username \
        -e DB_PASS=password \
        usgs/hydra-web-service:latest
    ```

    - `--name hydra-web-service`
      specify a container name `hydra-web-service`.
    - `-d`
      run as a daemon (in the background).
    - `-p 8000:8000` \
      forward docker host port 8000 (left side of colon)
      to container port 8000 (right side of colon)
    - `-e DB_DSN=host/sid` \
      specify hydra database hostname and system id
    - `-e DB_USER=username` \
      specify hydra database user name
    - `-e DB_PASS=password` \
      specify hydra database password
    - `usgs/hydra-web-service:latest`
      use the `usgs/hydra-web-service:latest` image from docker hub.


- Connect to running container in browser
  ```
  http://localhost:8000/ws/hydra/
  ```
