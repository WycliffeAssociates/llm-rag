#!/bin/bash

if [ -z "$DEPLOY_ENV" ]; then
  echo "Error: Please set the 'DEPLOY_ENV' environment variable."
  exit 1
fi


if [ -z "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
  echo "Error: Please set the 'OP_SERVICE_ACCOUNT_TOKEN' environment variable."
  exit 1
fi

shopt -s expand_aliases

alias op="docker run --rm -e OP_SERVICE_ACCOUNT_TOKEN 1password/op:2 op"

export OP_SERVICE_ACCOUNT_TOKEN=$OP_SERVICE_ACCOUNT_TOKEN

# Define environment variables
export OPENAI_API_KEY=$(op read "op://DevOps/openai-key/credential")
export DB_PATH=/server/database
export DATA_SOURCE_DIR=/server/data-sources

# Build and start the Docker containers
docker compose down
docker compose build --build-arg OPENAI_API_KEY=${OPENAI_API_KEY}
docker compose up -d
