# Chọn image Node
FROM node:20-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ project
COPY . .

# Expose port
EXPOSE 5000

# Chạy app
CMD ["npm", "start"]
