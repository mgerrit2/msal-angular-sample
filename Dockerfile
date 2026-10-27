# Stage 1: Build de Angular app
FROM node:24-alpine AS build
WORKDIR /app

# Kopieer package files en installeer dependencies
COPY package*.json ./
RUN npm install

# Kopieer de rest van de code en bouw de app
COPY . .
# FIX: Voeg --base-href / toe zodat de scripts in de root worden gezocht
RUN npm run build -- --configuration development --base-href /

# Stage 2: Serve de app met Nginx
FROM nginx:alpine

# Verwijder eventuele restanten van de standaard Nginx pagina
RUN rm -rf /usr/share/nginx/html/*

# Kopieer de gebouwde bestanden (inhoud van nl-BE) naar de Nginx root
COPY --from=build /app/dist/msal-angular-sample/browser/. /usr/share/nginx/html/

# Kopieer je aangepaste nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80




