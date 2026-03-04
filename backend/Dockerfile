FROM golang:1.25-alpine AS builder

WORKDIR /costrace

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o costrace .

FROM alpine:3.20

WORKDIR /costrace

RUN apk add --no-cache curl

ARG MAXMIND_LICENSE_KEY
RUN if [ -n "$MAXMIND_LICENSE_KEY" ]; then \
      curl -sSL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" \
        -o /tmp/geolite2.tar.gz && \
      tar -xzf /tmp/geolite2.tar.gz -C /tmp && \
      cp /tmp/GeoLite2-City_*/GeoLite2-City.mmdb . && \
      rm -rf /tmp/geolite2.tar.gz /tmp/GeoLite2-City_*; \
    fi

COPY --from=builder /costrace/costrace .

EXPOSE 8081

CMD ["./costrace"]