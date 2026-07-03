const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, '../docs/02-engineering/mermaid-gallery');

// 1. 定義要刪除的檔案
const filesToDelete = [
  '12-sankey-diagram.md',
  '14-requirement-diagram.md'
];

filesToDelete.forEach(file => {
  const filePath = path.join(galleryDir, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`已刪除無法渲染的圖表: ${file}`);
  }
});

// 2. 定義需要向前遞補與重設位置的對照表 [舊檔名, 新檔名, 新 sidebar_position]
const renameMap = [
  ['13-xy-chart.md', '12-xy-chart.md', 12],
  ['15-user-journey.md', '13-user-journey.md', 13],
  ['16-packet-diagram.md', '14-packet-diagram.md', 14],
  ['17-cloud-infrastructure.md', '15-cloud-infrastructure.md', 15]
];

renameMap.forEach(([oldName, newName, newPos]) => {
  const oldPath = path.join(galleryDir, oldName);
  const newPath = path.join(galleryDir, newName);

  if (fs.existsSync(oldPath)) {
    // 讀取並更正內部的 sidebar_position
    let content = fs.readFileSync(oldPath, 'utf8');
    content = content.replace(/sidebar_position:\s*\d+/, `sidebar_position: ${newPos}`);
    
    // 寫入新檔名，並移除舊檔案
    fs.writeFileSync(newPath, content, 'utf8');
    fs.unlinkSync(oldPath);
    
    console.log(`已遞補重排: ${oldName} ➡️ ${newName} (position: ${newPos})`);
  }
});

console.log("資料夾整理完成！");
