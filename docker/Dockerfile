FROM php:fpm

RUN echo "deb http://http.debian.net/debian jessie-backports main" | tee -a /etc/apt/sources.list

RUN apt-get update && apt-get install -y \
    git \
    maven \
    raptor-utils \
    && apt-get -t jessie-backports install -y openjdk-8-jdk openjdk-8-jre openjdk-8-jdk-headless

RUN set -ex \
    && update-java-alternatives --set java-1.8.0-openjdk-amd64 \
    && cd / && rm -rf tarql && git clone  https://github.com/tarql/tarql.git tarql \
    && cd tarql && git checkout 007bf50 && mvn package appassembler:assemble \
    && chmod +x /tarql/target/appassembler/bin/tarql \
    && cd / && mkdir uploads
