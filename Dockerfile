### Init database stage ###
FROM python:3.11-slim AS builder

WORKDIR /server

ENV DB_PATH=/server/database
ENV DATA_SOURCE_DIR=/server/data-sources

COPY data-sources/ data-sources/
COPY database.py .
COPY requirements.txt .

RUN pip install -r requirements.txt
RUN python init-database.py


### Set up server stage ###
FROM python:3.11-slim

WORKDIR /server

# Copy database folder from previous stage
COPY --from=builder /server/database/ /server/database/
# Copy the source files to the container
COPY requirements.txt .
COPY rag-server.py .
COPY database.py .
COPY glossary.py .

# Install Python dependencies
RUN pip install -r requirements.txt

EXPOSE 80

ENV PYTHONUNBUFFERED=1

# Run rag-server.py when the container launches
CMD ["python", "rag-server.py"]
