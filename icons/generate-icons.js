// 这个脚本用于生成基本的图标文件
// 运行方法：在浏览器中打开此文件，点击"生成图标"按钮

document.addEventListener('DOMContentLoaded', () => {
  const sizes = [16, 48, 128];
  
  // 创建UI
  const container = document.createElement('div');
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.maxWidth = '600px';
  container.style.margin = '0 auto';
  container.style.padding = '20px';
  container.style.textAlign = 'center';
  document.body.appendChild(container);
  
  const title = document.createElement('h1');
  title.textContent = 'MyTab 图标生成器';
  container.appendChild(title);
  
  const description = document.createElement('p');
  description.textContent = '点击下面的按钮生成所需的图标文件，然后右键点击图标并选择"图片另存为..."，保存为对应的文件名。';
  container.appendChild(description);
  
  const iconContainer = document.createElement('div');
  iconContainer.style.display = 'flex';
  iconContainer.style.justifyContent = 'center';
  iconContainer.style.flexWrap = 'wrap';
  iconContainer.style.gap = '20px';
  iconContainer.style.margin = '30px 0';
  container.appendChild(iconContainer);
  
  // 生成图标按钮
  const generateButton = document.createElement('button');
  generateButton.textContent = '生成图标';
  generateButton.style.padding = '10px 20px';
  generateButton.style.fontSize = '16px';
  generateButton.style.backgroundColor = '#4285f4';
  generateButton.style.color = 'white';
  generateButton.style.border = 'none';
  generateButton.style.borderRadius = '4px';
  generateButton.style.cursor = 'pointer';
  generateButton.style.marginBottom = '30px';
  container.appendChild(generateButton);
  
  // 事件监听器
  generateButton.addEventListener('click', () => {
    iconContainer.innerHTML = '';
    
    sizes.forEach(size => {
      const wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      
      // 创建画布
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // 绘制图标背景 - 使用渐变
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#4285f4'); // 蓝色
      gradient.addColorStop(1, '#34a853'); // 绿色
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, size * 0.2); // 圆角矩形
      ctx.fill();
      
      // 绘制字母M
      ctx.fillStyle = 'white';
      ctx.font = `bold ${Math.round(size * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', size / 2, size / 2);
      
      // 将画布转换为图像
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.style.display = 'block';
      img.style.border = '1px solid #ddd';
      img.style.margin = '10px 0';
      
      // 添加文件名标签
      const label = document.createElement('p');
      label.textContent = `icon${size}.png`;
      label.style.margin = '5px 0';
      label.style.fontSize = '14px';
      
      // 添加保存指示
      const saveInstructions = document.createElement('p');
      saveInstructions.textContent = '右击图标 → 图片另存为';
      saveInstructions.style.fontSize = '12px';
      saveInstructions.style.color = '#666';
      
      wrapper.appendChild(img);
      wrapper.appendChild(label);
      wrapper.appendChild(saveInstructions);
      iconContainer.appendChild(wrapper);
    });
    
    // 添加使用说明
    const instructions = document.createElement('div');
    instructions.style.marginTop = '30px';
    instructions.style.padding = '15px';
    instructions.style.backgroundColor = '#f8f9fa';
    instructions.style.borderRadius = '4px';
    
    const instructionsTitle = document.createElement('h3');
    instructionsTitle.textContent = '使用方法';
    instructions.appendChild(instructionsTitle);
    
    const instructionsList = document.createElement('ol');
    instructionsList.style.textAlign = 'left';
    instructionsList.style.paddingLeft = '20px';
    
    const steps = [
      '对每个图标右键点击并选择"图片另存为..."',
      '将它们保存为相应的文件名（icon16.png, icon48.png, icon128.png）',
      '将这些文件保存到扩展的 icons 文件夹中',
      '完成后更新 manifest.json 文件以引用这些图标'
    ];
    
    steps.forEach(step => {
      const listItem = document.createElement('li');
      listItem.textContent = step;
      listItem.style.margin = '8px 0';
      instructionsList.appendChild(listItem);
    });
    
    instructions.appendChild(instructionsList);
    container.appendChild(instructions);
  });
}); 