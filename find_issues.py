import json

try:
    with open("C:/Users/ASUS/.gemini/antigravity-ide/brain/3ae4173e-f8aa-4bbe-901d-6e76bf547c3a/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8", errors="ignore") as f:
        for line_num, line in enumerate(f, 1):
            if "browser_subagent" in line:
                print(f"=== LINE {line_num} ===")
                data = json.loads(line)
                print("Step:", data.get("step_index"))
                print("Type:", data.get("type"))
                print("Status:", data.get("status"))
                content = data.get("content") or ""
                # print first 1000 characters and last 1000 characters
                if len(content) > 2000:
                    print(content[:1000] + "\n... TRUNCATED ...\n" + content[-1000:])
                else:
                    print(content)
                print("-" * 50)
except Exception as e:
    print("Error:", e)
