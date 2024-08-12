FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /server

# Copy the source files to container
COPY requirements.txt .
COPY rag-server.py .
COPY database.py .
COPY glossary.py .

# Clone the data source repo
RUN apt update && apt install -y git
RUN git clone https://github.com/AnonymousWalker/data-sources.git

# Install python dependencies
RUN pip install -r requirements.txt

EXPOSE 80

# environment variables
ENV PYTHONUNBUFFERED=1
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV DB_PATH="/server/database"
ENV DATA_SOURCE_DIR="/server/data-sources"


# Run rag-server.py when the container launches
CMD ["python", "rag-server.py"]
