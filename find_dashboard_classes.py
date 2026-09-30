import re

def get_classes(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    classes = set()
    for m in re.findall(r'className="([^"]+)"', content):
        for c in m.split():
            classes.add(c)
    for m in re.findall(r'className=\{`([^`]+)`\}', content):
        cleaned = re.sub(r'\$\{[^}]+\}', ' ', m)
        for c in cleaned.split():
            classes.add(c)
    return sorted(list(classes))

print("StudentDashboard classes:")
stud_classes = get_classes("src/pages/StudentDashboard.jsx")
for c in stud_classes[:30]:
    if '-' in c:
        print(f"  - {c}")

print("\nAdminDashboard classes:")
admin_classes = get_classes("src/pages/AdminDashboard.jsx")
for c in admin_classes[:30]:
    if '-' in c:
        print(f"  - {c}")
