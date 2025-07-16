const fs = require('fs');
const path = require('path');

/**
 * 从Line Awesome CSS文件中提取所有图标类名
 */
function extractLineAwesomeIcons() {
  const cssFilePath = path.join(__dirname, '../dist/newtab/line-awesome.min.css');
  const outputDir = path.join(__dirname, '../dist/icons');
  const outputFilePath = path.join(outputDir, 'line-awesome-classes.json');

  try {
    // 读取CSS文件
    console.log('读取CSS文件:', cssFilePath);
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');

    // 正则表达式匹配 .la-* 图标类名
    const iconRegex = /\.la-([\w-]+):before/g;

    // 提取所有图标类名
    const matches = [...cssContent.matchAll(iconRegex)];
    const allIconClasses = matches.map(match => `la-${match[1]}`);

    // 去重
    const uniqueIconClasses = [...new Set(allIconClasses)];

    const icons = [];
    const iconSet = new Set(); // 用于去重

    console.log('开始解析图标类名...');
    console.log(`找到 ${uniqueIconClasses.length} 个图标`);

    // 处理所有图标
    uniqueIconClasses.forEach(className => {
      // 跳过一些非图标的类名
      if (shouldSkipClass(className)) {
        return;
      }

      // 避免重复
      if (!iconSet.has(className)) {
        iconSet.add(className);

        // 检查图标类型并确定正确的前缀
        const iconType = determineIconType(className, cssContent);
        const iconPrefix = iconType.prefix;
        const isBrandIcon = iconType.isBrand;

        const iconData = {
          name: formatIconName(className),
          class: `${iconPrefix} ${className}`,
          className: className,
          unicode: '', // 暂时留空，可以后续添加unicode映射
          variants: getIconVariants(className, cssContent),
          isBrand: isBrandIcon
        };

        icons.push(iconData);
      }
    });

    // 按名称排序
    icons.sort((a, b) => a.name.localeCompare(b.name));

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 创建输出数据
    const outputData = {
      metadata: {
        source: 'Line Awesome',
        version: '1.3.0',
        totalIcons: icons.length,
        extractedAt: new Date().toISOString(),
        description: 'Line Awesome图标类名列表，从line-awesome.min.css提取'
      },
      icons: icons,
      categories: categorizeIcons(icons),
      variants: ['las', 'lar', 'lab', 'lad', 'lal'] // Line Awesome支持的变体
    };

    // 写入JSON文件
    fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf8');

    console.log(`✅ 成功提取 ${icons.length} 个图标类名`);
    console.log(`📁 输出文件: ${outputFilePath}`);

    // 显示一些统计信息
    console.log('\n📊 统计信息:');
    console.log(`- 总图标数: ${icons.length}`);
    console.log(`- 分类数: ${Object.keys(outputData.categories).length}`);
    console.log(`- 支持变体: ${outputData.variants.join(', ')}`);

    // 显示前10个图标作为示例
    console.log('\n🎨 示例图标:');
    icons.slice(0, 10).forEach(icon => {
      console.log(`  - ${icon.name} (${icon.class})`);
    });

    return outputData;

  } catch (error) {
    console.error('❌ 提取图标时发生错误:', error.message);
    throw error;
  }
}

/**
 * 判断是否应该跳过某个类名
 */
function shouldSkipClass(className) {
  const skipPatterns = [
    /^la-\d+x$/, // 大小类名如 la-2x, la-3x
    /^la-(xs|sm|lg)$/, // 尺寸类名
    /^la-(spin|pulse)$/, // 动画类名
    /^la-rotate-/, // 旋转类名
    /^la-flip-/, // 翻转类名
    /^la-stack/, // 堆叠类名
    /^la-inverse$/, // 反色类名
    /^la-border$/, // 边框类名
    /^la-pull-/, // 浮动类名
    /^la-fw$/, // 固定宽度类名
  ];

  return skipPatterns.some(pattern => pattern.test(className));
}

/**
 * 格式化图标名称（将连字符转换为更友好的名称）
 */
function formatIconName(className) {
  return className
    .replace(/^la-/, '') // 移除la-前缀
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 确定图标类型和正确的前缀
 */
function determineIconType(className, cssContent) {
  // 检查是否为品牌图标
  const brandPatterns = [
    new RegExp(`\\.la\\.${className}\\s*\\{[^}]*font-family:\\s*['"]Line Awesome Brands['"]`, 'g'),
    new RegExp(`\\.la\\.${className}\\s*\\{[^}]*font-family:'Line Awesome Brands'`, 'g'),
    new RegExp(`\\.la\\.${className}\\{[^}]*font-family:'Line Awesome Brands'`, 'g'),
    new RegExp(`\\.la\\.${className}\\{font-family:'Line Awesome Brands'`, 'g')
  ];
  
  const isBrand = brandPatterns.some(pattern => pattern.test(cssContent));
  
  if (isBrand) {
    return { prefix: 'lab', isBrand: true };
  }
  
  // 检查是否为Regular图标 (outline style)
  const regularPatterns = [
    new RegExp(`\\.la\\.${className}\\s*\\{[^}]*font-family:\\s*['"]Line Awesome Free['"].*font-weight:\\s*400`, 'g'),
    new RegExp(`\\.la\\.${className}\\s*\\{[^}]*font-family:'Line Awesome Free'.*font-weight:400`, 'g'),
    new RegExp(`\\.la\\.${className}\\{[^}]*font-family:'Line Awesome Free'.*font-weight:400`, 'g')
  ];
  
  const isRegular = regularPatterns.some(pattern => pattern.test(cssContent));
  
  if (isRegular) {
    return { prefix: 'lar', isBrand: false };
  }
  
  // 检查常见的品牌图标名称（作为后备检测）
  const brandKeywords = [
    '500px', 'accessible-icon', 'accusoft', 'adn', 'adobe', 'adversal', 'affiliatetheme',
    'algolia', 'amazon', 'amilia', 'android', 'angellist', 'angrycreative', 'angular',
    'app-store', 'apper', 'apple', 'artstation', 'asymmetrik', 'audible', 'autoprefixer',
    'avianex', 'aviato', 'aws', 'bandcamp', 'behance', 'bimobject', 'bitbucket', 'bitcoin',
    'bity', 'black-tie', 'blackberry', 'blogger', 'bluetooth', 'btc', 'buromobelexperte',
    'buysellads', 'cc-amazon-pay', 'cc-amex', 'cc-apple-pay', 'cc-diners-club', 'cc-discover',
    'cc-jcb', 'cc-mastercard', 'cc-paypal', 'cc-stripe', 'cc-visa', 'centercode', 'chrome',
    'cloudscale', 'cloudsmith', 'cloudversify', 'codepen', 'codiepie', 'connectdevelop',
    'contao', 'cpanel', 'creative-commons', 'css3', 'cuttlefish', 'dailymotion', 'dashcube',
    'delicious', 'deploydog', 'deskpro', 'deviantart', 'digg', 'digital-ocean', 'discord',
    'discourse', 'dochub', 'docker', 'draft2digital', 'dribbble', 'dropbox', 'drupal',
    'dyalog', 'earlybirds', 'ebay', 'edge', 'elementor', 'ember', 'empire', 'envira',
    'erlang', 'ethereum', 'etsy', 'expeditedssl', 'facebook', 'firefox', 'first-order',
    'flickr', 'flipboard', 'fly', 'font-awesome', 'fonticons', 'fort-awesome', 'forumbee',
    'foursquare', 'free-code-camp', 'freebsd', 'fulcrum', 'galactic-republic', 'galactic-senate',
    'get-pocket', 'gg', 'git', 'github', 'gitlab', 'gitter', 'glide', 'gofore', 'goodreads',
    'google', 'google-drive', 'google-play', 'google-plus', 'google-wallet', 'gratipay',
    'grav', 'gripfire', 'grunt', 'gulp', 'hacker-news', 'hackerrank', 'hips', 'hire-a-helper',
    'hooli', 'hotjar', 'houzz', 'html5', 'hubspot', 'imdb', 'instagram', 'internet-explorer',
    'ioxhost', 'itunes', 'java', 'jedi-order', 'jenkins', 'joget', 'joomla', 'js',
    'jsfiddle', 'keybase', 'keycdn', 'kickstarter', 'korvue', 'laravel', 'lastfm',
    'leanpub', 'less', 'line', 'linkedin', 'linode', 'linux', 'lyft', 'magento',
    'mailchimp', 'mandalorian', 'mastodon', 'maxcdn', 'medapps', 'medium', 'medrt',
    'meetup', 'megaport', 'microsoft', 'mix', 'mixcloud', 'mizuni', 'modx', 'monero',
    'napster', 'nintendo-switch', 'node', 'npm', 'ns8', 'nutritionix', 'odnoklassniki',
    'old-republic', 'opencart', 'openid', 'opera', 'optin-monster', 'osi', 'page4',
    'pagelines', 'palfed', 'patreon', 'paypal', 'periscope', 'phabricator', 'phoenix-framework',
    'phoenix-squadron', 'php', 'pied-piper', 'pinterest', 'playstation', 'product-hunt',
    'pushed', 'python', 'qq', 'quinscape', 'quora', 'r-project', 'ravelry', 'react',
    'readme', 'rebel', 'red-river', 'reddit', 'rendact', 'renren', 'replyd', 'researchgate',
    'resolving', 'rocketchat', 'rockrms', 'safari', 'sass', 'schlix', 'scribd', 'searchengin',
    'sellcast', 'sellsy', 'servicestack', 'shirtsinbulk', 'shopware', 'simplybuilt',
    'sistrix', 'sith', 'skyatlas', 'skype', 'slack', 'slideshare', 'snapchat', 'soundcloud',
    'speakap', 'spotify', 'squarespace', 'stack-exchange', 'stack-overflow', 'staylinked',
    'steam', 'sticker-mule', 'strava', 'stripe', 'studiovinari', 'stumbleupon', 'superpowers',
    'supple', 'telegram', 'tencent-weibo', 'themeisle', 'trade-federation', 'trello',
    'tripadvisor', 'tumblr', 'twitch', 'twitter', 'typo3', 'uber', 'uikit', 'uniregistry',
    'untappd', 'usb', 'ussunnah', 'vaadin', 'viacoin', 'viadeo', 'viber', 'vimeo',
    'vine', 'vk', 'vnv', 'vuejs', 'weibo', 'weixin', 'whatsapp', 'whmcs', 'wikipedia-w',
    'windows', 'wix', 'wolf-pack-battalion', 'wordpress', 'wpbeginner', 'wpexplorer',
    'wpforms', 'xbox', 'xing', 'y-combinator', 'yahoo', 'yandex', 'yelp', 'yoast',
    'youtube', 'zhihu'
  ];
  
  const iconName = className.replace('la-', '');
  const isBrandByName = brandKeywords.includes(iconName);
  
  if (isBrandByName) {
    return { prefix: 'lab', isBrand: true };
  }
  
  // 默认为solid图标
  return { prefix: 'las', isBrand: false };
}

/**
 * 检查图标是否为品牌图标（保留向后兼容）
 */
function isBrandIconClass(className, cssContent) {
  const iconType = determineIconType(className, cssContent);
  return iconType.isBrand;
}

/**
 * 获取图标的所有变体
 */
function getIconVariants(className, cssContent) {
  const variants = [];
  const variantPrefixes = ['las', 'lar', 'lab', 'lad', 'lal'];

  variantPrefixes.forEach(prefix => {
    // 检查CSS中是否存在该变体
    const variantRegex = new RegExp(`\\.${prefix}\\.${className}:before`, 'g');
    if (variantRegex.test(cssContent)) {
      variants.push(prefix);
    }
  });

  // 如果没有找到特定变体，设置默认值
  if (variants.length === 0) {
    // 检查是否为品牌图标
    const isBrand = isBrandIconClass(className, cssContent);
    variants.push(isBrand ? 'lab' : 'las');
  }

  return variants;
}

/**
 * 将图标按类别分组
 */
function categorizeIcons(icons) {
  const categories = {
    popular: [],
    interface: [],
    media: [],
    communication: [],
    business: [],
    technology: [],
    social: [],
    travel: [],
    shopping: [],
    health: [],
    education: [],
    entertainment: [],
    food: [],
    nature: [],
    weather: [],
    sports: [],
    tools: [],
    arrows: [],
    shapes: [],
    brands: [],
    other: []
  };

  // 定义分类关键词
  const categoryKeywords = {
    popular: ['home', 'user', 'heart', 'star', 'search', 'settings', 'menu', 'close', 'check', 'times'],
    interface: ['menu', 'bars', 'cog', 'settings', 'gear', 'sliders', 'toggle', 'switch', 'button'],
    media: ['play', 'pause', 'stop', 'music', 'video', 'film', 'camera', 'image', 'photo', 'volume'],
    communication: ['envelope', 'mail', 'phone', 'comment', 'chat', 'message', 'bell', 'notification'],
    business: ['briefcase', 'building', 'chart', 'graph', 'money', 'dollar', 'credit', 'bank', 'invoice'],
    technology: ['laptop', 'desktop', 'mobile', 'tablet', 'code', 'database', 'server', 'cloud', 'wifi'],
    social: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'share', 'like', 'thumbs'],
    travel: ['plane', 'car', 'train', 'bus', 'ship', 'map', 'location', 'compass', 'suitcase'],
    shopping: ['shopping', 'cart', 'bag', 'store', 'tag', 'price', 'gift', 'package'],
    health: ['heart', 'medical', 'hospital', 'pill', 'stethoscope', 'ambulance', 'first-aid'],
    education: ['book', 'graduation', 'school', 'university', 'pencil', 'pen', 'notebook'],
    entertainment: ['gamepad', 'dice', 'puzzle', 'trophy', 'award', 'ticket', 'theater'],
    food: ['coffee', 'pizza', 'hamburger', 'apple', 'wine', 'beer', 'utensils', 'restaurant'],
    nature: ['tree', 'leaf', 'flower', 'sun', 'moon', 'cloud', 'mountain', 'water'],
    weather: ['sun', 'moon', 'cloud', 'rain', 'snow', 'wind', 'temperature', 'thermometer'],
    sports: ['football', 'basketball', 'tennis', 'golf', 'swimming', 'running', 'bicycle', 'dumbbell'],
    tools: ['wrench', 'hammer', 'screwdriver', 'tools', 'repair', 'construction', 'build'],
    arrows: ['arrow', 'angle', 'chevron', 'caret', 'long-arrow'],
    shapes: ['circle', 'square', 'triangle', 'star', 'diamond', 'heart', 'polygon'],
    brands: ['google', 'apple', 'microsoft', 'amazon', 'facebook', 'twitter', 'github', 'adobe']
  };

  // 为每个图标分配类别
  icons.forEach(icon => {
    const iconName = icon.className.toLowerCase();
    let assigned = false;

    // 检查每个类别的关键词
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => iconName.includes(keyword))) {
        categories[category].push(icon);
        assigned = true;
        break;
      }
    }

    // 如果没有匹配到任何类别，放入other
    if (!assigned) {
      categories.other.push(icon);
    }
  });

  // 移除空的类别
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    extractLineAwesomeIcons();
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

module.exports = { extractLineAwesomeIcons };