const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 读取package.json获取版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 生成时间戳
const now = new Date();
const timestamp = now.toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d{3}Z$/, '')
  .replace('T', '-');

// 生成文件名
const fileName = `mytab-extension-v${version}-${timestamp}.zip`;
const outputPath = path.join(__dirname, '..', fileName);

// 检查dist目录是否存在
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('错误: dist目录不存在，请先运行 npm run build');
  process.exit(1);
}

// 创建压缩文件
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // 设置压缩级别
});

// 监听事件
output.on('close', function() {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ 打包完成: ${fileName}`);
  console.log(`📦 文件大小: ${sizeInMB} MB`);
  console.log(`📍 文件位置: ${outputPath}`);
});

output.on('end', function() {
  console.log('数据传输完成');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('警告:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  console.error('打包错误:', err);
  process.exit(1);
});

// 连接输出流
archive.pipe(output);

console.log(`🚀 开始打包 dist 目录...`);
console.log(`📦 输出文件: ${fileName}`);

// 添加dist目录中的所有文件
archive.directory(distPath, false);

// 完成压缩
archive.finalize(); 