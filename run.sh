
# Define environment variables
export OPENAI_API_KEY=op://DevOps/openai-key/credential
export DB_PATH=/server/database
export DATA_SOURCE_DIR=/server/data-sources

# Build and start the Docker containers
docker compose build 
docker-compose up --build -d
