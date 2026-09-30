import os

# Let's search the workspace files for any automated execution strings (like "python", "run", "script")
# specifically in webpack configs, package.json, or vscode files.
found = []
for root, dirs, files in os.walk("."):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if "build" in dirs:
        dirs.remove("build")
    for file in files:
        if file.endswith((".json", ".js", ".html", ".css", ".sh", ".bat")):
            path = os.path.join(root, file)
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                if "python" in content.lower() or "extract_classes" in content.lower() or "find_all" in content.lower():
                    found.append((path, "Contains automated task trigger keywords"))
            except Exception as e:
                pass

print("Search results:")
for path, desc in found:
    print(f"  {path}: {desc}")
