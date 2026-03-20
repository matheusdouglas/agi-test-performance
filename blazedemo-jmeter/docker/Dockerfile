FROM eclipse-temurin:17-jre-jammy

ARG JMETER_VERSION=5.6.3
ENV JMETER_HOME=/opt/jmeter \
    JMETER_BIN=/opt/jmeter/bin
ENV PATH="$JMETER_BIN:${PATH}"

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates unzip tar && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /opt && \
    curl -fsSL https://dlcdn.apache.org/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz -o /tmp/jmeter.tgz || \
    curl -fsSL https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz -o /tmp/jmeter.tgz && \
    tar -xzf /tmp/jmeter.tgz -C /opt && \
    mv /opt/apache-jmeter-${JMETER_VERSION} ${JMETER_HOME} && \
    rm -f /tmp/jmeter.tgz

COPY jmeter/ /tests/
COPY docker/entrypoint.sh /entrypoint.sh
WORKDIR /tests
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
