const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../docs/02-engineering/mermaid-gallery');

if (!fs.existsSync(dir)) {
  console.error("Directory not found:", dir);
  process.exit(1);
}

fs.readdirSync(dir).forEach(file => {
  if (!file.endsWith('.md')) return;
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. 找到 "### 📋 複製即用代碼" 以後的段落並整段替換為乾淨的格式
  const parts = content.split(/### 📋 複製即用代碼/);
  if (parts.length === 2) {
    const header = parts[0];
    const codeSection = parts[1];
    
    // 提取真正的 Mermaid 代碼內容 (去除嵌套的 ```mermaid 和外層包裹)
    const codeMatch = codeSection.match(/```(?:mermaid|text)?\r?\n([\s\S]*?)\r?\n```/);
    if (codeMatch) {
      let rawCode = codeMatch[1].trim();
      
      // 如果代碼內部還殘留著 ```mermaid 開頭，再剝離一次
      if (rawCode.startsWith('```mermaid')) {
        rawCode = rawCode.replace(/^```mermaid\r?\n/, '').replace(/\r?\n```$/, '').trim();
      }

      const newContent = `${header}### 📋 複製即用代碼 (請用 \`\`\`mermaid 包裹)

\`\`\`text
${rawCode}
\`\`\`
`;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`已優化排版: ${file}`);
    }
  }
});

console.log("全部優化完成！");
