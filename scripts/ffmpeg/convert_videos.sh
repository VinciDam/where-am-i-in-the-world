#!/bin/bash

# Directory containing input files (can be set to "." for current directory)
INPUT_DIR="../../videos/alphabet"
OUTPUT_DIR="../../videos/converted_alphabet"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Loop through all .mp4 files in the input directory
for input_file in "$INPUT_DIR"/*.mp4; do
    # Extract filename without extension
    filename=$(basename "$input_file" .mp4)

    # Define output filename
    output_file="$OUTPUT_DIR/${filename}_converted.mp4"

    # Run ffmpeg command
    ffmpeg -i "$input_file" -vcodec h264 -b:v 1000k -acodec mp3 "$output_file"
done
