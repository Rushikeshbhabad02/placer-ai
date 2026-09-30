import json

try:
    with open("C:/Users/ASUS/.gemini/antigravity-ide/brain/3ae4173e-f8aa-4bbe-901d-6e76bf547c3a/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8") as f:
        for idx, line in enumerate(f, 1):
            data = json.loads(line)
            step = data.get("step_index")
            if step in [77, 78]:
                print(f"=== STEP {step} ({data.get('type')}) ===")
                content = data.get("content") or ""
                print(content[:1500])
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    print(f"  Tool: {tc.get('name')}")
                    print(f"  Args: {str(tc.get('args'))[:500]}")
                print("-" * 50)
except Exception as e:
    print("Error:", e)
