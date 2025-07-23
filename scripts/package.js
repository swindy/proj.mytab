const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * 打包扩展为ZIP文件
 */
function packageExtension() {
  const distDir = path.join(__dirname, '../dist');
  const outputDir = path.join(__dirname, '..');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = path.join(outputDir, `mytab-extension-v1.0.0-${timestamp}.zip`);

  return new Promise((resolve, reject) => {
    // 创建输出流
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // 最高压缩级别
    });

    output.on('close', () => {
      console.log(`✅ 扩展已打包: ${path.basename(outputPath)}`);
      console.log(`📦 文件大小: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve(outputPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    // 连接输出流
    archive.pipe(output);

    // 添加dist目录中的所有文件
    archive.directory(distDir, false);

    // 完成打包
    archive.finalize();
  });
}

/**
 * 完整的构建和打包流程
 */
async function buildAndPackage() {
  try {
    console.log('🚀 开始完整构建流程...\n');

    // 1. 构建项目
    console.log('4️⃣ 构建项目...');
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('');

    // 2. 打包扩展
    console.log('5️⃣ 打包扩展...');
    const packagePath = await packageExtension();
    console.log('');

    console.log('🎉 构建流程完成！');
    console.log(`📦 扩展包: ${path.basename(packagePath)}`);

  } catch (error) {
    console.error('❌ 构建流程失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--package-only')) {
    // 仅打包
    packageExtension().catch(error => {
      console.error('打包失败:', error);
      process.exit(1);
    });
  } else {
    // 完整构建流程
    buildAndPackage();
  }
}

module.exports = { packageExtension, buildAndPackage };