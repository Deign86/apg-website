#!/usr/bin/env bash
# Rebalance the mixer's stems (voice forward, bed lower), then two-pass master to -14 LUFS / -1.5 dBTP.
set -e
S=${1:-audio/stems}; OUT=${2:-audio/mix-balanced.wav}
PRE=$(mktemp --suffix=.wav)
ffmpeg -v error -y -i "$S/voice.wav" -i "$S/music.wav" -i "$S/sfx.wav" -filter_complex "
[0:a]highpass=f=80,acompressor=threshold=-18dB:ratio=2.5:attack=8:release=120:makeup=2,volume=2dB[v];
[1:a]volume=-4dB[m];
[2:a]volume=0dB[s];
[v][m][s]amix=inputs=3:normalize=0:dropout_transition=0" -ar 48000 -ac 2 "$PRE"
J=$(ffmpeg -nostats -i "$PRE" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['input_i'],d['input_tp'],d['input_lra'],d['input_thresh'],d['target_offset'])")
read -r I TP LRA TH OFF <<<"$MI"
ffmpeg -v error -y -i "$PRE" -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true" -ar 48000 -ac 2 "$OUT"
rm -f "$PRE"
ffmpeg -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tr -s ' ' | tr '\n' ' '; echo
