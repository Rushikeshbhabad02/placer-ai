import json

with open("C:/Users/ASUS/.gemini/antigravity-ide/brain/503abfa9-48db-4eef-9e07-692260c6dc39/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8", errors="ignore") as f:
    for idx, line in enumerate(f, 1):
        if "delete" in line.lower() or "remove" in line.lower():
            try:
                data = json.loads(line)
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    if "delete" in tc.get("name", "").lower():
                        print(f"Step {data.get('step_index')}: Deleted file: {tc.get('args')}")
            except Exception as e:
                pass
