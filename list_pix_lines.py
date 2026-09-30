with open("src/pages/RecruiterDashboard.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    if "pix-" in line:
        clean_line = "".join(c if ord(c) < 128 else "?" for c in line.strip())
        print(f"Line {idx}: {clean_line}")
