### Youtube Thumbnail Generator

This is a simple script that generates a thumbnail for a youtube video. using yt-dlp to download the youtube video and whisper.cpp to transcribe the video.

# Docker Commands
### How to build docker image
```
docker build --no-cache -t whisper-server .
```

### How to run docker container
```
docker run -d --name whisper-instance -p 3000:3000 whisper-server
```

### How to get shell into docker container
```
docker run --rm -it whisper-server /bin/bash
```