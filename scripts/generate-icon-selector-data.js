const fs = require('fs');
const path = require('path');

/**
 * 从完整的图标数据生成适用于图标选择器的精简数据
 */
function generateIconSelectorData() {
  const inputFilePath = path.join(__dirname, '../dist/icons/line-awesome-classes.json');
  const outputFilePath = path.join(__dirname, '../dist/icon-selector-data.json');

  try {
    console.log('读取完整图标数据...');
    const fullData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    
    // 直接使用所有图标，只保留class字段
    const allIcons = fullData.icons.map(icon => ({
      class: icon.class
    }));

    // 构建最终的图标选择器数据
    const iconSelectorData = {
      metadata: {
        source: 'Line Awesome (All Icons)',
        totalIcons: allIcons.length,
        generatedAt: new Date().toISOString(),
        description: '所有Line Awesome图标，仅包含class字段'
      },
      allIcons: allIcons
    };

    // 写入文件
    fs.writeFileSync(outputFilePath, JSON.stringify(iconSelectorData, null, 2), 'utf8');

    console.log(`✅ 成功生成图标选择器数据`);
    console.log(`📁 输出文件: ${outputFilePath}`);
    console.log(`📊 统计信息:`);
    console.log(`  - 总图标数: ${iconSelectorData.metadata.totalIcons}`);

    return iconSelectorData;

  } catch (error) {
    console.error('❌ 生成图标选择器数据时发生错误:', error.message);
    throw error;
  }
}



// 如果直接运行此脚本
if (require.main === module) {
  try {
    generateIconSelectorData();
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

module.exports = { generateIconSelectorData };