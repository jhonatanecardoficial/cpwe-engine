FROM node:20-slim

WORKDIR /app

# Instalar bash e utilitários
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependência
COPY package.json package-lock.json* ./

# Instalar todas as dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Compilar o TypeScript
RUN npm run build

# Definir o comando padrão para subir o worker que escuta a fila do Temporal
CMD ["npm", "start"]
