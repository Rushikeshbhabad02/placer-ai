with open("C:/Users/ASUS/.gemini/antigravity-ide/brain/503abfa9-48db-4eef-9e07-692260c6dc39/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8", errors="ignore") as f:
    for line_num, line in enumerate(f, 1):
        if "pix-" in line:
            # Print without emojis
            safe_line = "".join(c for c in line if ord(c) < 128)
            print(f"Line {line_num} (len {len(safe_line)}): {safe_line[:150]}...")
