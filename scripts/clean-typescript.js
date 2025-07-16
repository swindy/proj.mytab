const fs = require('fs');
const path = require('path');

/**
 * 清理TypeScript文件中的重复图标数据定义
 */
function cleanTypeScriptFile() {
  const tsFilePath = path.join(__dirname, '../src/newtab/newtab.ts');

  try {
    console.log('读取TypeScript文件...');
    let content = fs.readFileSync(tsFilePath, 'utf8');

    // 删除旧的图标数据定义
    console.log('删除重复的图标数据定义...');
    
    // 删除重复的interface IconData定义
    const interfaceRegex = /\/\/ Line Awesome 图标数据\s*interface IconData \{[\s\S]*?\}/g;
    content = content.replace(interfaceRegex, '');
    
    // 删除重复的iconCategories定义
    const iconCategoriesRegex = /\/\/ 图标分类数据\s*const iconCategories: Record<string, IconData\[\]> = \{[\s\S]*?\};/g;
    content = content.replace(iconCategoriesRegex, '');
    
    // 删除重复的allIcons定义
    const allIconsRegex = /\/\/ 所有图标的完整列表\s*const allIcons: IconData\[\] = \[[\s\S]*?\];/g;
    content = content.replace(allIconsRegex, '');
    
    // 删除重复的currentCategory和currentSearchTerm定义
    const currentVarsRegex = /\/\/ 当前选中的分类\s*let currentCategory = 'popular';\s*let currentSearchTerm = '';/g;
    content = content.replace(currentVarsRegex, '');
    
    // 删除重复的函数定义
    const duplicateFunctions = [
      /\/\/ 清除图标选择\s*function clearIconSelection\(\): void \{[\s\S]*?\}/g,
      /\/\/ 加载图标数据\s*async function loadIconData\(\): Promise<void> \{[\s\S]*?\}/g,
      /\/\/ 使用默认图标数据.*?\s*function useDefaultIcons\(\): void \{[\s\S]*?\}/g,
      /\/\/ 从图标列表渲染图标\s*function renderIconsFromList\(icons: IconData\[\]\): void \{[\s\S]*?\}/g,
      /\/\/ 渲染指定分类的图标\s*function renderIcons\(category: string\): void \{[\s\S]*?\}/g,
      /\/\/ 初始化图标选择器\s*async function initIconSelector\(\): Promise<void> \{[\s\S]*?\}/g
    ];
    
    duplicateFunctions.forEach(regex => {
      const matches = content.match(regex);
      if (matches && matches.length > 1) {
        // 保留第一个，删除其余的
        for (let i = 1; i < matches.length; i++) {
          content = content.replace(matches[i], '');
        }
      }
    });

    // 写回文件
    fs.writeFileSync(tsFilePath, content, 'utf8');
    
    console.log('✅ TypeScript文件清理完成');

  } catch (error) {
    console.error('❌ 清理TypeScript文件时发生错误:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    cleanTypeScriptFile();
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

module.exports = { cleanTypeScriptFile };