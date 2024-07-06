# Use the official Node.js image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code into the working directory
COPY . .

# Install TypeORM CLI globally
RUN npm install -g typeorm

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3002

# Define the command to run the application
CMD ["npm", "start"]