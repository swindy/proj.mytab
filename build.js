const fs = require('fs');
const path = require('path');

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 复制文件
function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log(`复制: ${src} -> ${dest}`);
}

// 复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  
  ensureDir(dest);
  const files = fs.readdirSync(src);
  
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

// 主构建函数
function build() {
  console.log('开始构建...');
  
  // 确保dist目录存在
  ensureDir('dist');
  
  // 复制manifest.json（如果不存在）
  if (!fs.existsSync('dist/manifest.json')) {
    if (fs.existsSync('manifest.json')) {
      copyFile('manifest.json', 'dist/manifest.json');
    } else {
      console.log('警告: manifest.json 不存在');
    }
  }
  
  // 复制HTML和CSS文件
  copyFile('src/popup/popup.html', 'dist/popup/popup.html');
  copyFile('src/popup/popup.css', 'dist/popup/popup.css');
  
  // 复制新标签页文件（如果存在）
  if (fs.existsSync('newtab/newtab.html')) {
    copyFile('newtab/newtab.html', 'dist/newtab/newtab.html');
  }
  if (fs.existsSync('newtab/newtab.css')) {
    copyFile('newtab/newtab.css', 'dist/newtab/newtab.css');
  }
  
  // 复制图标目录
  if (fs.existsSync('icons')) {
    copyDir('icons', 'dist/icons');
  }
  
  // 复制其他文件
  if (fs.existsSync('test-sidebar.html')) {
    copyFile('test-sidebar.html', 'dist/test-sidebar.html');
  }
  
  console.log('构建完成！');
}

// 运行构建
build(); 