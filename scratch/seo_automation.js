const fs = require('fs');
const path = require('path');

// 遞迴取得所有 markdown 檔案
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.docusaurus') {
        getFiles(name, files);
      }
    } else {
      if (name.endsWith('.md') || name.endsWith('.mdx')) {
        files.push(name);
      }
    }
  }
  return files;
}

// 處理單一檔案，解析並補齊 Frontmatter
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterRegex = /^---([\s\S]*?)---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return;
  
  let yamlStr = match[1];
  let body = content.replace(frontmatterRegex, '').trim();
  
  const yamlLines = yamlStr.split('\n');
  const metadata = {};
  
  // 第一階段：讀取現有的一級屬性（忽略陣列項目與縮排內容）
  yamlLines.forEach(line => {
    const idx = line.indexOf(':');
    const isNewKey = idx !== -1 && !line.startsWith(' ') && !line.startsWith('-');
    if (isNewKey) {
      const key = line.substring(0, idx).trim();
      const val = line.substring(idx + 1).trim();
      metadata[key] = val;
    }
  });

  // 1. 取得標題 (Title)
  let title = '';
  if (metadata.title) {
    title = metadata.title.replace(/['"]/g, '');
  } else {
    const h1Match = body.match(/^#\s+(.*)/m);
    if (h1Match) {
      title = h1Match[1].trim();
    }
  }

  // 2. 自動補齊 Description (若缺失)
  let newDescription = metadata.description;
  if (!newDescription || newDescription.trim() === '""' || newDescription.trim() === "''") {
    let cleanBody = body
      .replace(/<[\s\S]*?>/g, '') // 移除 HTML 標記
      .replace(/[\#\*\_`\[\]\(\)\-\+\!\?]/g, '') // 移除 markdown 語法
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, '') // 移除 MDX 註解
      .replace(/\s+/g, ' ')
      .trim();
    
    newDescription = cleanBody.slice(0, 150);
    if (cleanBody.length > 150) newDescription += '...';
    
    // 💡 重要：轉義反斜線 `\` 與雙引號 `"`，防止 YAML 解析 C:\Users\User 報錯
    newDescription = newDescription.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    newDescription = `"${newDescription}"`;
  } else {
    // 即使原本就有 description，如果含有反斜線也需要轉義以防 build 失敗
    if (newDescription.includes('\\') && !newDescription.startsWith('"') && !newDescription.startsWith("'")) {
      newDescription = `"${newDescription.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
  }

  // 3. 自動生成 Keywords 關鍵字陣列 (若缺失)
  let newKeywords = metadata.keywords;
  if (!newKeywords || newKeywords.trim() === '""' || newKeywords.trim() === "''") {
    const keywordsSet = new Set();
    
    if (title) {
      const titleWords = title
        .split(/[\s，。、：：\-｜\(\)（）\+\/\*\[\]「」『』"']/)
        .filter(w => w.trim().length > 1 && !/^[0-9]+$/.test(w.trim()));
      titleWords.forEach(w => keywordsSet.add(w.trim()));
    }
    
    if (metadata.tags) {
      const tags = metadata.tags.replace(/[\[\]'"]/g, '').split(',').map(t => t.trim());
      tags.forEach(t => {
        if (t && t.length > 1) keywordsSet.add(t);
      });
    }

    const projectRoot = path.join(__dirname, '..');
    const relPath = path.relative(projectRoot, filePath);
    const pathParts = relPath.split(path.sep).slice(0, -1);
    pathParts.forEach(p => {
      const cleanPart = p.replace(/^\d+-/, '');
      if (cleanPart && cleanPart.length > 1 && cleanPart !== 'docs' && cleanPart !== 'blog') {
        keywordsSet.add(cleanPart);
      }
    });

    if (keywordsSet.size > 0) {
      newKeywords = `[${Array.from(keywordsSet).join(', ')}]`;
    }
  }

  // 第二階段：重組 YAML，徹底移除舊有的 description 與 keywords 區塊（包含多行列表）
  let updatedYaml = [];
  let skipMode = false;
  
  for (let i = 0; i < yamlLines.length; i++) {
    const line = yamlLines[i];
    const trimmed = line.trim();
    
    const idx = line.indexOf(':');
    const isNewKey = idx !== -1 && !line.startsWith(' ') && !line.startsWith('-');
    
    if (isNewKey) {
      const key = line.substring(0, idx).trim();
      if (key === 'description' || key === 'keywords') {
        skipMode = true;
        continue;
      } else {
        skipMode = false;
      }
    } else if (skipMode) {
      if (line.startsWith(' ') || line.startsWith('-') || trimmed === '') {
        continue; // 忽略多行內容
      } else {
        skipMode = false;
      }
    }
    
    updatedYaml.push(line);
  }

  // 補上新的描述與關鍵字
  if (newDescription) {
    updatedYaml.push(`description: ${newDescription}`);
  }
  if (newKeywords) {
    updatedYaml.push(`keywords: ${newKeywords}`);
  }

  const newContent = `---
${updatedYaml.join('\n').trim()}
---

${body}`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
}

const docsDir = path.join(__dirname, '../docs');
const blogDir = path.join(__dirname, '../blog');

console.log('開始修復並重新掃描 Docs 與 Blog...');
const files = [...getFiles(docsDir), ...getFiles(blogDir)];
console.log(`偵測到 ${files.length} 個檔案。開始套用修正後的注入器...`);

let successCount = 0;
files.forEach((file) => {
  try {
    processFile(file);
    successCount++;
  } catch (err) {
    console.error(`處理檔案失敗: ${file}`, err.message);
  }
});

console.log(`🎉 修正完成！成功優化了 ${successCount} / ${files.length} 個檔案。`);
