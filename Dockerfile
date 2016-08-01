## Docker file to build app as container

FROM wnameless/oracle-xe-11g
MAINTAINER "Jeremy Fee" <jmfee@usgs.gov>
LABEL dockerfile_version="v0.1.0"


# install dependencies
RUN apt-key update -y \
    && apt-get update -y \
    && apt-get install -y \
        build-essential \
        bzip2 \
        curl \
        g++ \
        git \
        make \
        python \
    && curl -o- \
        https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh \
        | /bin/bash \
    && /bin/bash -c " \
        source /root/.nvm/nvm.sh \
        && nvm install 4.2.4 \
        "


# copy application (ignores set in .dockerignore)
COPY . /hazdev-project

# configure application
RUN /bin/bash -c " \
    source /root/.nvm/nvm.sh; \
    export NON_INTERACTIVE=true; \
    source /u01/app/oracle/product/11.2.0/xe/bin/oracle_env.sh; \
    cd /hazdev-project \
    && npm install \
    && ./src/lib/pre-install \
    && rm -r \
        /root/.npm \
        /tmp/npm* \
    "


WORKDIR /hazdev-project
EXPOSE 8881
ENTRYPOINT src/lib/run
