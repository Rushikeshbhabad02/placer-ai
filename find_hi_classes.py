with open("src/pages/AdminDashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

start = content.find("sidebar-user")
if start != -1:
    print(content[start-50:start+300])
else:
    print("sidebar-user not found")
