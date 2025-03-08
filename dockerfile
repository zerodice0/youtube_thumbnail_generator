FROM ubuntu:latest

# install dependencies
RUN apt update && apt install -y \
	yt-dlp ffmpeg git cmake g++ curl python3-pip nodejs npm \
	&& rm -rf /var/lib/apt/lists/*

# clone whisper.cpp and build
RUN git clone https://github.com/ggerganov/whisper.cpp.git /whisper.cpp \
	&& cd /whisper.cpp \
	&& make \
	&& make CFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8" CXXFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8"

# download whisper model
RUN cd /whisper.cpp/models && ./download-ggml-model.sh large

# copy server codes
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./

# install packages and run server
RUN npm install

# copy server codes
COPY . .

RUN npx tsc

# run server
CMD ["node", "dist/server.js"]
