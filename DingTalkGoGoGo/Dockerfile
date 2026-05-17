FROM golang:1.25-bookworm AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /out/GoDingtalk .

FROM debian:bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates ffmpeg chromium \
	&& rm -rf /var/lib/apt/lists/*

RUN useradd --system --create-home --home-dir /home/godingtalk --shell /usr/sbin/nologin godingtalk \
	&& mkdir -p /data/config /data/video \
	&& chown -R godingtalk:godingtalk /data /home/godingtalk

COPY --from=builder /out/GoDingtalk /usr/local/bin/GoDingtalk

ENV GODINGTALK_CONFIG_DIR=/data/config
ENV GODINGTALK_SAVE_DIR=/data/video
ENV GODINGTALK_COOKIES_FILE=/data/config/cookies.json
ENV GODINGTALK_SERVER_LISTEN=:8080
ENV GODINGTALK_SERVER_ENABLE_CORS=true

WORKDIR /data
USER godingtalk
EXPOSE 8080
VOLUME ["/data"]

ENTRYPOINT ["/usr/local/bin/GoDingtalk"]
CMD ["-serve"]
