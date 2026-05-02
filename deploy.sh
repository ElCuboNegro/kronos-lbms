#!/bin/bash

# Configuración
HOST="vps.kronosb.com"
DEST_DIR="/opt/lbms" # Ruta en el VPS donde vivirá el proyecto

# Verificar si se pasó el usuario como argumento
if [ -z "$1" ]; then
  echo "Uso: ./deploy.sh <usuario_ssh>"
  echo "Ejemplo: ./deploy.sh root"
  exit 1
fi

USER=$1

echo "🚀 Iniciando despliegue de LBMS hacia $USER@$HOST:$DEST_DIR..."

# 1. Crear el directorio remoto si no existe
ssh $USER@$HOST "mkdir -p $DEST_DIR"

# 2. Sincronizar los archivos (rsync es más rápido y seguro que scp)
# Excluimos carpetas pesadas o temporales
echo "📦 Transfiriendo archivos..."
rsync -avz --progress \
  --exclude '.git' \
  --exclude 'frontend/node_modules' \
  --exclude 'frontend/dist' \
  --exclude 'backend/app/__pycache__' \
  --exclude 'backend/.pytest_cache' \
  --exclude '.env' \
  ./ $USER@$HOST:$DEST_DIR

# 3. Construir y levantar Docker en el servidor remoto
echo "🐳 Construyendo y levantando contenedores en el VPS..."
ssh $USER@$HOST "cd $DEST_DIR && docker compose -f docker-compose.yml up -d --build"

echo "✅ ¡Despliegue completado con éxito en http://$HOST!"
