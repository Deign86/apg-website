# Re-render this film on your GPU (Windows)

Requirements: Node 22+, FFmpeg on PATH (you already have HyperFrames installed under `~/.hyperframes`).

Open PowerShell in this folder (`apg-website\promo-video`) and run:

```powershell
npm install
npx hyperframes render . -o renders\apg-launch-muted.mp4 --quality delivery --gpu --browser-gpu --workers auto
ffmpeg -y -i renders\apg-launch-muted.mp4 -i audio\mix.flac -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest renders\apg-website-launch.mp4
```

- `--gpu` = hardware (NVENC) encoding, `--browser-gpu` = GPU-accelerated Chrome capture.
- First run may download Chrome Headless Shell (`npx hyperframes browser ensure`).
- `audio\mix.flac` is the finished mix (VO + SFX + music, −14 LUFS). To change the mix, edit `audio\cues.json` and re-run
  `uv run <path-to>\opus-sound-layer\scripts\mix.py audio\cues.json` (repo: https://github.com/Bodila51/opus-sound-layer), then re-mux.
- To change the voice lines: regenerate a line in VoiceStudio with the "Deign" profile (POST /v1/audio/speech, voice=18d8b782), drop it in `assets\vo\voN.wav`, re-mix, re-mux.
- Preview/edit the picture: `npx hyperframes preview` (Studio with a live timeline).
