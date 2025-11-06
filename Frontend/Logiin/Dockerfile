# Etapa 1: build de la app con Node
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --include=dev

# Copiar todo el proyecto
COPY . .

# Construir la app para producción
RUN npm run build

# Etapa 2: servir la app con Nginx
FROM nginx:alpine

# Copiar build al nginx html
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional: copiar configuración custom de nginx
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["npm", "run", "dev", "nginx", "-g", "daemon off;"]