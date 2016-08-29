## Docker file to build app as container

FROM wnameless/oracle-xe-11g
MAINTAINER "Jeremy Fee" <jmfee@usgs.gov>
LABEL dockerfile_version="v0.1.1"


# install dependencies
RUN apt-key update -y && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends \
        bzip2 \
        ca-certificates \
        curl \
        g++ \
        git \
        make \
        python && \
    apt-get clean


# install nvm
RUN export NVM_DIR="/nvm" && \
    curl -o- \
       https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh \
       | /bin/bash && \
    echo 'export NVM_DIR=/nvm' >> /etc/profile.d/nvm.sh && \
    echo '. ${NVM_DIR}/nvm.sh' >> /etc/profile.d/nvm.sh && \
    echo '. /u01/app/oracle/product/11.2.0/xe/bin/oracle_env.sh' \
        >> /etc/profile.d/oracle.sh && \
    echo 'export LD_LIBRARY_PATH=${ORACLE_HOME}/lib' \
        >> /etc/profile.d/oracle.sh && \
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
