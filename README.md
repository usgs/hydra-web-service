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

## Configuration
- run `src/lib/pre-install` to setup `src/conf/config.json`
- `MOUNT_PATH` is the base url for the application


## Docker

### Building a container

From root of project, run:
    ```
    docker build -t hydra-web-service:version .
    ```

### Running container

- Run the container using the tag
    ```
    docker run -it -p 8000:8881 hydra-web-service:version
    ```

- Connect to running container in browser
    ```
    docker-machine env default \
        | grep HOST \
        | sed s/.*tcp/http/g \
        | awk -F: '{print $1":"$2":8000"}' \
        | xargs open
    ```
