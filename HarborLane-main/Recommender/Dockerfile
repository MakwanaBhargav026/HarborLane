FROM python:3.9-slim

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app.py .
COPY recommender_model.pkl .

# Set environment variables
ENV PORT=5000
ENV MODEL_PATH=recommender_model.pkl
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]