import json

target_steps = [178, 179, 180, 181]

with open("C:/Users/ASUS/.gemini/antigravity-ide/brain/503abfa9-48db-4eef-9e07-692260c6dc39/.system_generated/logs/transcript.jsonl", "r", encoding="utf-8", errors="ignore") as f:
    for idx, line in enumerate(f, 1):
        try:
            data = json.loads(line)
            step = data.get("step_index")
            if step in target_steps:
                print(f"=== STEP {step} ({data.get('type')}) ===")
                tool_calls = data.get("tool_calls", [])
                for tc in tool_calls:
                    print(f"Tool: {tc.get('name')}")
                    args = tc.get("args", {})
                    # Clean strings in args
                    if isinstance(args, str):
                        try:
                            args = json.loads(args)
                        except:
                            pass
                    if isinstance(args, dict):
                        print(f"TargetFile: {args.get('TargetFile')}")
                        print(f"Instruction: {args.get('Instruction')}")
                        print(f"StartLine/EndLine: {args.get('StartLine')}/{args.get('EndLine')}")
                        content = args.get("ReplacementContent") or args.get("CodeContent")
                        if content:
                            print("Content preview:")
                            print("\n".join(content.splitlines()[:20]))
                if data.get("type") == "CODE_ACTION":
                    print("Code Action Content:")
                    content = data.get("content", "")
                    print("\n".join(content.splitlines()[:20]))
        except Exception as e:
            print("Error parsing line:", e)
