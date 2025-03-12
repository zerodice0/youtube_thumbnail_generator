# 유튜브 오디오 트랜스크립트 서버
이 서버는 yt-dlp를 사용하여 유튜브 오디오를 다운로드하고 whisper.cpp를 사용하여 오디오를 트랜스크립트하는 간단한 서버입니다. 추후 OpenAI API를 사용하여 자막 내용을 요약하는 등의 작업을 추가하려고 합니다. 

## .env 환경 변수 설정
```
BASE_URL=http://localhost
PORT=3000
WHISPER_BIN_PATH= # whisper.cpp 바이너리 경로
WHISPER_MODEL_PATH= # whisper.cpp 모델 경로
OPENAI_API_KEY= # OpenAI API Key
DATABASE_URL= # Prisma 데이터베이스 연결 문자열
```

## Prisma 명령어 정리
### 새로운 마이그레이션 생성
```
npx prisma migrate dev --name init
```

### 마이그레이션 적용
```
npx prisma migrate deploy
```

### 도커에서 Prisma 실행
```
docker run --name postgres-db -e POSTGRES_USER=your_username -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=your_database -p 5432:5432 -d postgres
```

### 마이그레이션 롤백
```
npx prisma migrate reset
```

## 추후에는 도커 이미지로 배포할 예정입니다. (아직 작업 안됨)
### 도커 이미지 빌드
```
docker build --no-cache -t whisper-server .
```

### 도커 컨테이너 실행
```
docker run -d --name whisper-instance -p 3000:3000 whisper-server
```

### 도커 컨테이너 쉘 접속
```
docker run --rm -it whisper-server /bin/bash
```