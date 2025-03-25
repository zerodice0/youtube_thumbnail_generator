FROM ubuntu:latest

# install dependencies
RUN apt update && apt install -y \
	yt-dlp ffmpeg git cmake g++ curl python3-pip nodejs npm \
	ca-certificates gnupg postgresql-client \
	&& rm -rf /var/lib/apt/lists/*

# Ollama 설치
RUN curl -fsSL https://ollama.com/install.sh | sh

# clone whisper.cpp and build
RUN git clone https://github.com/ggerganov/whisper.cpp.git /whisper.cpp \
	&& cd /whisper.cpp \
	&& make \
	&& make CFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8" CXXFLAGS="-mfp16-format=ieee -mfpu=neon-fp-armv8"

# download whisper model
RUN cd /whisper.cpp/models && ./download-ggml-model.sh large-v3-turbo

# 작업 디렉토리 생성 및 설정
WORKDIR /app

# package.json과 package-lock.json 먼저 복사
COPY package.json package-lock.json tsconfig.json ./

# npm 패키지 설치
RUN npm install

# 소스 코드 복사 (lib 디렉토리를 포함하여 문제가 발생할 수 있는 파일 제외)
COPY app ./app
COPY prisma ./prisma
COPY lib ./lib
COPY components ./components
COPY middleware.ts ./
COPY next-env.d.ts ./
COPY next.config.js ./
COPY postcss.config.mjs ./
COPY .env ./.env

# TypeScript 컴파일
RUN npx tsc

# 서버 및 Ollama 실행을 위한 시작 스크립트 생성
RUN echo '#!/bin/bash\n\
# 환경 변수 설정\n\
source .env\n\
\n\
# 데이터베이스 연결 테스트\n\
echo "Testing database connection..."\n\
DB_HOST=$(echo $DATABASE_URL | sed -n "s/.*@\\([^:]*\\).*/\\1/p")\n\
DB_PORT=$(echo $DATABASE_URL | sed -n "s/.*:\\([0-9]*\\)\\/.*/\\1/p")\n\
DB_NAME=$(echo $DATABASE_URL | sed -n "s/.*\\/\\([^?]*\\).*/\\1/p")\n\
DB_USER=$(echo $DATABASE_URL | sed -n "s/.*\\/\\/\\([^:]*\\).*/\\1/p")\n\
\n\
echo "Attempting to connect to PostgreSQL at $DB_HOST:$DB_PORT..."\n\
timeout 30 bash -c "until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do echo waiting for database; sleep 2; done"\n\
\n\
if [ $? -ne 0 ]; then\n\
  echo "Failed to connect to PostgreSQL. Please check your DATABASE_URL and ensure PostgreSQL is running."\n\
  echo "Current DATABASE_URL: $DATABASE_URL"\n\
  echo "If running in Docker, make sure to use host.docker.internal instead of localhost"\n\
  exit 1\n\
fi\n\
\n\
# Prisma 데이터베이스 마이그레이션\n\
echo "Running Prisma migrations..."\n\
npx prisma migrate deploy\n\
\n\
# Ollama 서버 시작\n\
echo "Starting Ollama server..."\n\
OLLAMA_HOST=0.0.0.0:11434 ollama serve &\n\
OLLAMA_PID=$!\n\
# Ollama 서버가 시작될 때까지 대기\n\
echo "Waiting for Ollama server to start..."\n\
sleep 5\n\
# 모델 다운로드\n\
echo "Downloading Gemma 3 model..."\n\
ollama pull gemma3:4b\n\
# prisma generate\n\
echo "Generating Prisma client..."\n\
npx prisma generate\n\
# 서버 빌드\n\
echo "Building server..."\n\
npm run build\n\
# Node.js 서버 시작\n\
echo "Starting Node.js server..."\n\
npx next start -H 0.0.0.0\n\
' > /start.sh && chmod +x /start.sh

# 시작 스크립트 실행
CMD ["/start.sh"]
