## Docker file to build app as container

FROM debian:jessie
MAINTAINER "Jeremy Fee" <jmfee@usgs.gov>
LABEL dockerfile_version="v0.1.2"


# install dependencies
RUN apt-key update -y && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends \
        bzip2 \
        ca-certificates \
        curl \
        g++ \
        git \
        libaio1 \
        make \
        python \
        unzip && \
    apt-get clean


# install oracle instantclient
COPY instantclient-* /opt/oracle/

RUN /bin/bash -c " \
    cd /opt/oracle && \
    unzip instantclient-basic* && \
    unzip instantclient-sdk* && \
    rm instantclient-* && \
    ln -s instantclient_* instantclient && \
    cd instantclient && \
    ln libclntsh.so* libclntsh.so && \
    echo 'export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/opt/oracle/instantclient' \
        >> /etc/profile.d/oracle.sh \
    "


# install nvm
RUN export NVM_DIR="/nvm" && \
    curl -o- \
       https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh \
       | /bin/bash && \
    echo 'export NVM_DIR=/nvm' >> /etc/profile.d/nvm.sh && \
    echo '. ${NVM_DIR}/nvm.sh' >> /etc/profile.d/nvm.sh && \
    /bin/bash --login -c "nvm install 4.2.4"


# copy application (ignores set in .dockerignore)
COPY . /hazdev-project


# create non-root user
RUN useradd \
        -c 'Docker image user' \
        -m \
        -r \
        -s /sbin/nologin \
        -U \
        hazdev-user && \
    chown -R hazdev-user:hazdev-user /hazdev-project


# switch to hazdev-user
USER hazdev-user


# configure application
RUN /bin/bash --login -c " \
        cd /hazdev-project && \
        export NON_INTERACTIVE=true && \
        npm install && \
        rm -r \
            $HOME/.npm \
            /tmp/npm* \
        "


WORKDIR /hazdev-project
EXPOSE 8000
CMD [ "/hazdev-project/src/lib/docker-entrypoint.sh" ]
