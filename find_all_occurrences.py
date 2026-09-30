import os

occurrences = []
for root, dirs, files in os.walk("."):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if "build" in dirs:
        dirs.remove("build")
    for file in files:
        if file.endswith((".js", ".jsx", ".css", ".html")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_num, line in enumerate(f, 1):
                    if "pix-" in line:
                        occurrences.append((path, line_num, line.strip()))

print(f"Found {len(occurrences)} occurrences:")
for path, line_num, line in occurrences[:50]:
    print(f"  {path}:{line_num}: {line}")
