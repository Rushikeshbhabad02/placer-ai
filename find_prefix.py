with open("src/pages/dashboard.css", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = re.findall(r'\.tab[s]?-?[a-zA-Z0-9_-]*', content.lower())
print("Matches containing tab/tabs:", set(matches))
