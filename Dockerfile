FROM python:3.11-slim

WORKDIR /server

# Copy the source files to the container
COPY requirements.txt .
COPY rag-server.py .
COPY database.py .
COPY glossary.py .
COPY data-sources /server/data-sources

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 80

ENV PYTHONUNBUFFERED=1

# Run rag-server.py when the container launches
CMD ["python", "rag-server.py"]
