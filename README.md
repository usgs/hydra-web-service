hydra-web-service
==============
[![Build Status](https://travis-ci.org/usgs/hydra-web-service.svg?branch=master)](https://travis-ci.org/usgs/hydra-web-service)

Web service for information from Hydra backend.


Using the Generated Project
---------------------------

## Getting Started
- run `npm install` to install application development dependencies
- configure the application
- run `npm run dev` from the install directory


## Docker

### Building a container

From root of project, run:
    ```
    docker build -t usgs/hydra-web-service:version .
    ```

### Running container

- Run the container using the tag
    ```
    docker run -it -p 8000:8000 hydra-web-service:version
    ```

- Configure container
    ```
    docker run -it -p 8000:8000 usgs/hydra-web-service:VERSION
    ```

    stop container, and find ID using:
    ```
    docker ps -a
    ```

    Start the container interactively to run pre-install
    ```
    docker run --entrypoint /bin/bash -it IMAGEID
    ```

    At the container command prompt, run pre-install then exit:
    ```
    src/lib/pre-install
    exit
    ```

    save configuration:
    ```
    docker commit -c 'ENTRYPOINT src/lib/run' IMAGEID usgs/hydra-web-service:VERSION_configured
    ```

    run container as a daemon
    ```
    docker run -d -p 8000:8000 usgs/hydra-web-service:VERSION_configured
    ```

- Connect to running container in browser
    ```
    docker-machine env default \
        | grep HOST \
        | sed s/.*tcp/http/g \
        | awk -F: '{print $1":"$2":8000/ws/hydra/"}' \
        | xargs open
    ```
