FROM node:20-alpine

EXPOSE 8800

# Create working directory
WORKDIR /app

# Copy source
COPY . .

RUN npm install

# Run the app
CMD ["npm", "run", "dev"]
