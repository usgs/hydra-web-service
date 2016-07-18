## Docker file to build app as container

FROM debian:jessie
MAINTAINER "Jeremy Fee" <jmfee@usgs.gov>
LABEL dockerfile_version="v0.1.0"


# install dependencies
RUN apt-key update -y \
    && apt-get update -y \
    && apt-get install -y \
        bzip2 \
        curl \
        git \
    && curl -o- \
        https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh \
        | /bin/bash \
    && /bin/bash --login -c " \
        nvm install 4.2.4

# copy application (ignores set in .dockerignore)
COPY . /hazdev-project

# configure application
RUN /bin/bash --login -c " \
    cd /hazdev-project \
    && npm install \
    && ./src/lib/pre-install --non-interactive \
    && rm -r \
        /root/.npm \
        /tmp/npm* \
    "


WORKDIR /hazdev-project
EXPOSE 8881
CMD /bin/bash --login -c "node start"
