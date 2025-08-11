FROM webratio/nodejs-http-server

VOLUME /tmp
ADD dist /opt/www
ADD run.sh /opt/run.sh
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
EXPOSE 8080
ENTRYPOINT ["sh","/opt/run.sh" ]