import re

with open("src/pages/StudentDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Match className="..." or className={`...`}
class_names = set()

# Pattern for simple className="class1 class2"
matches1 = re.findall(r'className="([^"]+)"', content)
for m in matches1:
    for cls in m.split():
        if '$' not in cls: # Skip dynamic template variables for now
            class_names.add(cls)

# Pattern for template literal className={`...`}
matches2 = re.findall(r'className=\{`([^`]+)`\}', content)
for m in matches2:
    # Remove template placeholders like ${...}
    cleaned = re.sub(r'\$\{[^}]+\}', ' ', m)
    for cls in cleaned.split():
        class_names.add(cls)

# Pattern for dynamic className={preferences.compactView ? "compact-ui" : ""}
matches3 = re.findall(r'className=\{\s*[^?]+\?\s*"([^"]+)"\s*:\s*"([^"]*)"\s*\}', content)
for m1, m2 in matches3:
    if m1:
        for cls in m1.split(): class_names.add(cls)
    if m2:
        for cls in m2.split(): class_names.add(cls)

print("Extracted classes:")
for cls in sorted(class_names):
    print(f"  - {cls}")
