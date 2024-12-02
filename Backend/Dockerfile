# Select base image 
FROM python:3.12
# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
# Select the directory where the app is located
WORKDIR /app
# Install dependencies from requirements.txt 
COPY requirements.txt /app/requirements.txt
# Update pip and install dependencies from requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt
# Create a directory for uploads
RUN mkdir -p /app/uploads
# Copy the wait-for-it script
COPY wait-for-it.sh /app/wait-for-it.sh
# Make the script executable
RUN chmod +x /app/wait-for-it.sh
# Copy the app to the container
COPY . /app/
# Expose port 8000 where the app is running
EXPOSE 8000
# Execute the app when the container is started
CMD ["./wait-for-it.sh", "mongo:28017", "--", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
