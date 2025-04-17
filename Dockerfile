FROM reactnativecommunity/react-native-android
RUN apt update \
    && apt install -y \
        gradle \
        wget \
        unzip \
        curl \
        gulp

RUN npm install --global gulp-cli \
    && npm install --global sass

RUN wget https://services.gradle.org/distributions/gradle-8.13-all.zip \
   && unzip gradle-8.13-all.zip \
   && mv gradle-8.13 /opt/gradle \
   && rm gradle-8.13-all.zip

ENV GRADLE_HOME='/opt/gradle'
ENV PATH="${GRADLE_HOME}/bin:${PATH}"

RUN groupadd -g 1000 user \
    && useradd -u 1000 -g user user \
    && mkdir /workdir \
    && chown -R user:user /workdir
