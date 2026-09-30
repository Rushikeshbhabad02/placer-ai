import os

css_files = []
for root, dirs, files in os.walk("."):
    if "node_modules" in dirs:
        dirs.remove("node_modules")
    if "build" in dirs:
        dirs.remove("build")
    for file in files:
        if file.endswith(".css"):
            css_files.append(os.path.join(root, file))

print("All CSS files:")
for f in css_files:
    print(f"  - {f}")
