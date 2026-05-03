FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    libusb-1.0-0-dev \
    libjpeg-dev \
    zlib1g-dev \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# El servicio de impresión necesita acceso a USB,
# se debe correr con --privileged o mapeando /dev/bus/usb
CMD ["python", "main.py"]
