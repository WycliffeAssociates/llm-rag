FROM python:3.11-slim

WORKDIR /server

# Install dependencies
RUN apt-get update && apt-get install -y git

# Clone the data source repo
RUN git clone https://github.com/AnonymousWalker/data-sources.git

# Copy the source files to the container
COPY requirements.txt .
COPY rag-server.py .
COPY database.py .
COPY glossary.py .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 80

ENV PYTHONUNBUFFERED=1

# Run rag-server.py when the container launches
CMD ["python", "rag-server.py"]
