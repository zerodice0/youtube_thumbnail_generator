FROM ubuntu:latest

# install dependencies
RUN apt update && apt install -y \
	yt-dlp ffmpeg git cmake g++ curl python3-pip \
	&& rm -rf /var/lib/apt/lists/*

# clone whisper.cpp and build
RUN git clone https://github.com/ggerganov/whisper.cpp.git /whisper.cpp \
	&& cd /whisper.cpp \
	&& make \
	&& make CFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8" CXXFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8"


# download whisper model
RUN cd /whisper.cpp/models && ./download-ggml-model.sh large

# install node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
	&& apt install -y nodejs

# copy server codes
WORKDIR /app
COPY package.json package-lock.json ./

# install packages and run server
RUN npm install

# copy server codes
COPY . .

# run server
CMD ["node", "server.js"]
