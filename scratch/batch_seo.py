import os
import re

directory = "/Users/qiuliwen/Documents/工程師/project/liwendocusaurus/docs/next-js-notes/"

for filename in os.listdir(directory):
    if filename.endswith(".md") and filename.startswith("day-"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract title
        title_match = re.search(r'title:\s*"(.*?)"', content)
        if not title_match:
            title_match = re.search(r'title:\s*(.*)', content)
        
        if title_match:
            title = title_match.group(1).strip()
            
            # Check if description already exists
            if 'description:' not in content:
                # Generate a description based on the title
                day_num = filename.replace("day-", "").replace(".md", "")
                description = f"Next.js 30 天學習筆記系列 - 第 {day_num} 天：{title}。深入探討 Next.js 開發實戰技巧。"
                
                # Insert description before the closing ---
                new_content = re.sub(r'(---.*?)\n---', f'\\1\ndescription: "{description}"\n---', content, flags=re.DOTALL)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
            else:
                print(f"Skipped {filename} (already has description)")
