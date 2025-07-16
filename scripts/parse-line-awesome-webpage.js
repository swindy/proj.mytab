const fs = require('fs');
const path = require('path');

/**
 * 从Line Awesome网页内容中解析图标数据
 */
function parseLineAwesomeWebpage() {
  // 网页中的图标数据（从你提供的内容中提取）
  const webpageIconData = {
    "Accessibility": [
      "accessible-icon", "american-sign-language-interpreting", "assistive-listening-systems",
      "audio-description", "blind", "braille", "closed-captioning", "deaf", "low-vision",
      "phone-volume", "question-circle", "sign-language", "tty", "universal-access", "wheelchair"
    ],
    "Alert": [
      "bell", "bell-slash", "exclamation", "exclamation-circle", "exclamation-triangle",
      "radiation", "radiation-alt", "skull-crossbones"
    ],
    "Animals": [
      "cat", "crow", "dog", "dove", "dragon", "feather", "feather-alt", "fish", "frog",
      "hippo", "horse", "horse-head", "kiwi-bird", "otter", "paw", "spider"
    ],
    "Arrows": [
      "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up",
      "angle-down", "angle-left", "angle-right", "angle-up", "arrow-alt-circle-down",
      "arrow-alt-circle-left", "arrow-alt-circle-right", "arrow-alt-circle-up",
      "arrow-circle-down", "arrow-circle-left", "arrow-circle-right", "arrow-circle-up",
      "arrow-down", "arrow-left", "arrow-right", "arrow-up", "arrows-alt", "arrows-alt-h",
      "arrows-alt-v", "caret-down", "caret-left", "caret-right", "caret-square-down",
      "caret-square-left", "caret-square-right", "caret-square-up", "caret-up",
      "cart-arrow-down", "chart-line", "chevron-circle-down", "chevron-circle-left",
      "chevron-circle-right", "chevron-circle-up", "chevron-down", "chevron-left",
      "chevron-right", "chevron-up", "cloud-download-alt", "cloud-upload-alt",
      "compress-arrows-alt", "download", "exchange-alt", "expand-arrows-alt",
      "external-link-alt", "external-link-square-alt", "hand-point-down", "hand-point-left",
      "hand-point-right", "hand-point-up", "hand-pointer", "history", "level-down-alt",
      "level-up-alt", "location-arrow", "long-arrow-alt-down", "long-arrow-alt-left",
      "long-arrow-alt-right", "long-arrow-alt-up", "mouse-pointer", "play", "random",
      "recycle", "redo", "redo-alt", "reply", "reply-all", "retweet", "share",
      "share-square", "sign-in-alt", "sign-out-alt", "sort", "sort-alpha-down",
      "sort-alpha-down-alt", "sort-alpha-up", "sort-alpha-up-alt", "sort-amount-down",
      "sort-amount-down-alt", "sort-amount-up", "sort-amount-up-alt", "sort-down",
      "sort-numeric-down", "sort-numeric-down-alt", "sort-numeric-up", "sort-numeric-up-alt",
      "sort-up", "sync", "sync-alt", "text-height", "text-width", "undo", "undo-alt", "upload"
    ],
    "Audio & Video": [
      "audio-description", "backward", "broadcast-tower", "circle", "closed-captioning",
      "compress", "compress-arrows-alt", "eject", "expand", "expand-arrows-alt",
      "fast-backward", "fast-forward", "file-audio", "file-video", "film", "forward",
      "headphones", "microphone", "microphone-alt", "microphone-alt-slash",
      "microphone-slash", "music", "pause", "pause-circle", "phone-volume", "photo-video",
      "play", "play-circle", "podcast", "random", "redo", "redo-alt", "rss", "rss-square",
      "step-backward", "step-forward", "stop", "stop-circle", "sync", "sync-alt", "tv",
      "undo", "undo-alt", "video", "volume-down", "volume-mute", "volume-off", "volume-up",
      "youtube"
    ],
    "Brand Icons": [
      "500px", "accusoft", "adn", "adobe", "adversal", "affiliatetheme", "airbnb", "algolia",
      "amazon", "amilia", "android", "angellist", "angrycreative", "angular", "app-store",
      "app-store-ios", "apper", "apple", "artstation", "asymmetrik", "atlassian", "audible",
      "autoprefixer", "avianex", "aviato", "aws", "bandcamp", "battle-net", "behance",
      "behance-square", "bimobject", "bitbucket", "bity", "black-tie", "blackberry",
      "blogger", "blogger-b", "bootstrap", "buffer", "buromobelexperte", "buy-n-large",
      "buysellads", "canadian-maple-leaf", "centercode", "centos", "chrome", "chromecast",
      "cloudscale", "cloudsmith", "cloudversify", "codepen", "codiepie", "confluence",
      "connectdevelop", "contao", "cotton-bureau", "cpanel", "creative-commons",
      "creative-commons-by", "creative-commons-nc", "creative-commons-nc-eu",
      "creative-commons-nc-jp", "creative-commons-nd", "creative-commons-pd",
      "creative-commons-pd-alt", "creative-commons-remix", "creative-commons-sa",
      "creative-commons-sampling", "creative-commons-sampling-plus", "creative-commons-share",
      "creative-commons-zero", "css3", "css3-alt", "cuttlefish", "dashcube", "delicious",
      "deploydog", "deskpro", "dev", "deviantart", "dhl", "diaspora", "digg", "digital-ocean",
      "discord", "discourse", "dochub", "docker", "draft2digital", "dribbble", "dribbble-square",
      "dropbox", "drupal", "dyalog", "earlybirds", "ebay", "edge", "elementor", "ello",
      "ember", "empire", "envira", "erlang", "etsy", "evernote", "expeditedssl", "facebook",
      "facebook-f", "facebook-messenger", "facebook-square", "fedex", "fedora", "figma",
      "firefox", "first-order", "first-order-alt", "firstdraft", "flickr", "flipboard",
      "fly", "font-awesome", "font-awesome-alt", "font-awesome-flag", "fonticons",
      "fonticons-fi", "fort-awesome", "fort-awesome-alt", "forumbee", "foursquare",
      "free-code-camp", "freebsd", "fulcrum", "get-pocket", "git", "git-alt", "git-square",
      "github", "github-alt", "github-square", "gitkraken", "gitlab", "gitter", "glide",
      "glide-g", "gofore", "goodreads", "goodreads-g", "google", "google-drive",
      "google-play", "google-plus", "google-plus-g", "google-plus-square", "gratipay",
      "grav", "gripfire", "grunt", "gulp", "hacker-news", "hacker-news-square", "hackerrank",
      "hips", "hire-a-helper", "hooli", "hornbill", "hotjar", "houzz", "html5", "hubspot",
      "imdb", "instagram", "intercom", "internet-explorer", "invision", "ioxhost", "itch-io",
      "itunes", "itunes-note", "java", "jenkins", "jira", "joget", "joomla", "js", "js-square",
      "jsfiddle", "kaggle", "keybase", "keycdn", "kickstarter", "kickstarter-k", "korvue",
      "laravel", "lastfm", "lastfm-square", "leanpub", "less", "line", "linkedin",
      "linkedin-in", "linode", "linux", "lyft", "magento", "mailchimp", "mandalorian",
      "markdown", "mastodon", "maxcdn", "mdb", "medapps", "medium", "medium-m", "medrt",
      "meetup", "megaport", "mendeley", "microsoft", "mix", "mixcloud", "mizuni", "modx",
      "monero", "neos", "nimblr", "node", "node-js", "npm", "ns8", "nutritionix",
      "odnoklassniki", "odnoklassniki-square", "opencart", "openid", "opera", "optin-monster",
      "orcid", "osi", "page4", "pagelines", "palfed", "patreon", "periscope", "phabricator",
      "phoenix-framework", "phoenix-squadron", "php", "pied-piper", "pied-piper-alt",
      "pied-piper-hat", "pied-piper-pp", "pinterest", "pinterest-p", "pinterest-square",
      "product-hunt", "pushed", "python", "qq", "quinscape", "quora", "r-project",
      "raspberry-pi", "ravelry", "react", "reacteurope", "readme", "rebel", "red-river",
      "reddit", "reddit-alien", "reddit-square", "redhat", "renren", "replyd", "researchgate",
      "resolving", "rev", "rocketchat", "rockrms", "safari", "salesforce", "sass", "schlix",
      "scribd", "searchengin", "sellcast", "sellsy", "servicestack", "shirtsinbulk",
      "shopware", "simplybuilt", "sistrix", "sith", "sketch", "skyatlas", "skype", "slack",
      "slack-hash", "slideshare", "snapchat", "snapchat-ghost", "snapchat-square",
      "sourcetree", "speakap", "speaker-deck", "squarespace", "stack-exchange",
      "stack-overflow", "stackpath", "staylinked", "sticker-mule", "strava", "studiovinari",
      "stumbleupon", "stumbleupon-circle", "superpowers", "supple", "suse", "swift",
      "symfony", "teamspeak", "telegram", "telegram-plane", "tencent-weibo", "the-red-yeti",
      "themeco", "themeisle", "think-peaks", "trade-federation", "trello", "tripadvisor",
      "tumblr", "tumblr-square", "twitter", "twitter-square", "typo3", "uber", "ubuntu",
      "uikit", "umbraco", "uniregistry", "untappd", "ups", "usb", "usps", "ussunnah",
      "vaadin", "viacoin", "viadeo", "viadeo-square", "viber", "vimeo", "vimeo-square",
      "vimeo-v", "vine", "vk", "vnv", "vuejs", "waze", "weebly", "weibo", "weixin",
      "whatsapp", "whatsapp-square", "whmcs", "wikipedia-w", "windows", "wix",
      "wolf-pack-battalion", "wordpress", "wordpress-simple", "wpbeginner", "wpexplorer",
      "wpforms", "wpressr", "xing", "xing-square", "y-combinator", "yahoo", "yammer",
      "yandex", "yandex-international", "yarn", "yelp", "yoast", "youtube-square", "zhihu"
    ]
  };

  // 继续添加其他分类的图标...
  const additionalCategories = {
    "Buildings": [
      "archway", "building", "campground", "church", "city", "clinic-medical", "dungeon",
      "gopuram", "home", "hospital", "hospital-alt", "hotel", "house-damage", "igloo",
      "industry", "kaaba", "landmark", "monument", "mosque", "place-of-worship", "school",
      "store", "store-alt", "synagogue", "torii-gate", "university", "vihara", "warehouse"
    ],
    "Business": [
      "address-book", "address-card", "archive", "balance-scale", "balance-scale-left",
      "balance-scale-right", "birthday-cake", "book", "briefcase", "building", "bullhorn",
      "bullseye", "business-time", "calculator", "calendar", "calendar-alt", "certificate",
      "chart-area", "chart-bar", "chart-line", "chart-pie", "city", "clipboard", "coffee",
      "columns", "compass", "copy", "copyright", "cut", "edit", "envelope", "envelope-open",
      "envelope-square", "eraser", "fax", "file", "file-alt", "folder", "folder-minus",
      "folder-open", "folder-plus", "glasses", "globe", "highlighter", "industry",
      "landmark", "marker", "paperclip", "paste", "pen", "pen-alt", "pen-fancy", "pen-nib",
      "pen-square", "pencil-alt", "percent", "phone", "phone-alt", "phone-slash",
      "phone-square", "phone-square-alt", "phone-volume", "print", "project-diagram",
      "registered", "save", "sitemap", "socks", "sticky-note", "stream", "table", "tag",
      "tags", "tasks", "thumbtack", "trademark", "wallet"
    ],
    "Communication": [
      "address-book", "address-card", "american-sign-language-interpreting",
      "assistive-listening-systems", "at", "bell", "bell-slash", "bluetooth", "bluetooth-b",
      "broadcast-tower", "bullhorn", "chalkboard", "comment", "comment-alt", "comments",
      "envelope", "envelope-open", "envelope-square", "fax", "inbox", "language",
      "microphone", "microphone-alt", "microphone-alt-slash", "microphone-slash", "mobile",
      "mobile-alt", "paper-plane", "phone", "phone-alt", "phone-slash", "phone-square",
      "phone-square-alt", "phone-volume", "rss", "rss-square", "tty", "voicemail", "wifi"
    ],
    "Computers": [
      "database", "desktop", "download", "ethernet", "hdd", "headphones", "keyboard",
      "laptop", "memory", "microchip", "mobile", "mobile-alt", "mouse", "plug", "power-off",
      "print", "satellite", "satellite-dish", "save", "sd-card", "server", "sim-card",
      "stream", "tablet", "tablet-alt", "tv", "upload"
    ],
    "Currency": [
      "bitcoin", "btc", "dollar-sign", "ethereum", "euro-sign", "gg", "gg-circle",
      "hryvnia", "lira-sign", "money-bill", "money-bill-alt", "money-bill-wave",
      "money-bill-wave-alt", "money-check", "money-check-alt", "pound-sign", "ruble-sign",
      "rupee-sign", "shekel-sign", "tenge", "won-sign", "yen-sign"
    ],
    "Date & Time": [
      "bell", "bell-slash", "calendar", "calendar-alt", "calendar-check", "calendar-minus",
      "calendar-plus", "calendar-times", "clock", "hourglass", "hourglass-end",
      "hourglass-half", "hourglass-start", "stopwatch"
    ],
    "Design": [
      "adjust", "bezier-curve", "brush", "clone", "copy", "crop", "crop-alt", "crosshairs",
      "cut", "drafting-compass", "draw-polygon", "edit", "eraser", "eye", "eye-dropper",
      "eye-slash", "fill", "fill-drip", "highlighter", "icons", "layer-group", "magic",
      "marker", "object-group", "object-ungroup", "paint-brush", "paint-roller", "palette",
      "paste", "pen", "pen-alt", "pen-fancy", "pen-nib", "pencil-alt", "pencil-ruler",
      "ruler-combined", "ruler-horizontal", "ruler-vertical", "save", "splotch", "spray-can",
      "stamp", "swatchbook", "tint", "tint-slash", "vector-square"
    ],
    "Food": [
      "apple-alt", "bacon", "bone", "bread-slice", "candy-cane", "carrot", "cheese",
      "cloud-meatball", "cookie", "drumstick-bite", "egg", "fish", "hamburger", "hotdog",
      "ice-cream", "lemon", "pepper-hot", "pizza-slice", "seedling", "stroopwafel"
    ],
    "Games": [
      "chess", "chess-bishop", "chess-board", "chess-king", "chess-knight", "chess-pawn",
      "chess-queen", "chess-rook", "dice", "dice-d20", "dice-d6", "dice-five", "dice-four",
      "dice-one", "dice-six", "dice-three", "dice-two", "gamepad", "ghost", "headset",
      "heart", "playstation", "puzzle-piece", "steam", "steam-square", "steam-symbol",
      "twitch", "xbox"
    ],
    "Health": [
      "accessible-icon", "ambulance", "h-square", "heart", "heartbeat", "hospital",
      "medkit", "plus-square", "prescription", "stethoscope", "user-md", "wheelchair"
    ],
    "Interfaces": [
      "award", "ban", "barcode", "bars", "beer", "bell", "bell-slash", "blog", "bug",
      "bullhorn", "bullseye", "calculator", "calendar", "calendar-alt", "calendar-check",
      "calendar-minus", "calendar-plus", "calendar-times", "certificate", "check",
      "check-circle", "check-double", "check-square", "circle", "clipboard", "clone",
      "cloud", "cloud-download-alt", "cloud-upload-alt", "coffee", "cog", "cogs", "copy",
      "cut", "database", "dot-circle", "download", "edit", "ellipsis-h", "ellipsis-v",
      "envelope", "envelope-open", "eraser", "exclamation", "exclamation-circle",
      "exclamation-triangle", "external-link-alt", "external-link-square-alt", "eye",
      "eye-slash", "file", "file-alt", "file-download", "file-export", "file-import",
      "file-upload", "filter", "fingerprint", "flag", "flag-checkered", "folder",
      "folder-open", "frown", "glasses", "grip-horizontal", "grip-lines",
      "grip-lines-vertical", "grip-vertical", "hashtag", "heart", "history", "home",
      "i-cursor", "info", "info-circle", "language", "magic", "marker", "medal", "meh",
      "microphone", "microphone-alt", "microphone-slash", "minus", "minus-circle",
      "minus-square", "paste", "pen", "pen-alt", "pen-fancy", "pencil-alt", "plus",
      "plus-circle", "plus-square", "poo", "qrcode", "question", "question-circle",
      "quote-left", "quote-right", "redo", "redo-alt", "reply", "reply-all", "rss",
      "rss-square", "save", "screwdriver", "search", "search-minus", "search-plus",
      "share", "share-alt", "share-alt-square", "share-square", "shield-alt", "sign-in-alt",
      "sign-out-alt", "signal", "sitemap", "sliders-h", "smile", "sort", "sort-alpha-down",
      "sort-alpha-down-alt", "sort-alpha-up", "sort-alpha-up-alt", "sort-amount-down",
      "sort-amount-down-alt", "sort-amount-up", "sort-amount-up-alt", "sort-down",
      "sort-numeric-down", "sort-numeric-down-alt", "sort-numeric-up", "sort-numeric-up-alt",
      "sort-up", "star", "star-half", "sync", "sync-alt", "thumbs-down", "thumbs-up",
      "times", "times-circle", "toggle-off", "toggle-on", "tools", "trash", "trash-alt",
      "trash-restore", "trash-restore-alt", "trophy", "undo", "undo-alt", "upload", "user",
      "user-alt", "user-circle", "volume-down", "volume-mute", "volume-off", "volume-up",
      "wifi", "wrench"
    ],
    "Medical": [
      "allergies", "ambulance", "band-aid", "biohazard", "bone", "bong", "book-medical",
      "brain", "briefcase-medical", "burn", "cannabis", "capsules", "clinic-medical",
      "comment-medical", "crutch", "diagnoses", "dna", "file-medical", "file-medical-alt",
      "file-prescription", "first-aid", "heart", "heartbeat", "hospital", "hospital-alt",
      "hospital-symbol", "id-card-alt", "joint", "laptop-medical", "microscope",
      "mortar-pestle", "notes-medical", "pager", "pills", "plus", "poop", "prescription",
      "prescription-bottle", "prescription-bottle-alt", "procedures", "radiation",
      "radiation-alt", "smoking", "smoking-ban", "star-of-life", "stethoscope", "syringe",
      "tablets", "teeth", "teeth-open", "thermometer", "tooth", "user-md", "user-nurse",
      "vial", "vials", "weight", "x-ray"
    ],
    "Music": [
      "drum", "drum-steelpan", "file-audio", "guitar", "headphones", "headphones-alt",
      "microphone", "microphone-alt", "microphone-alt-slash", "microphone-slash", "music",
      "napster", "play", "record-vinyl", "sliders-h", "soundcloud", "spotify", "volume-down",
      "volume-mute", "volume-off", "volume-up"
    ],
    "Objects": [
      "ambulance", "anchor", "archive", "award", "baby-carriage", "balance-scale",
      "balance-scale-left", "balance-scale-right", "bath", "bed", "beer", "bell", "bicycle",
      "binoculars", "birthday-cake", "blender", "bomb", "book", "book-dead", "bookmark",
      "briefcase", "broadcast-tower", "bug", "building", "bullhorn", "bullseye", "bus",
      "calculator", "calendar", "calendar-alt", "camera", "camera-retro", "candy-cane",
      "car", "carrot", "church", "clipboard", "cloud", "coffee", "cog", "cogs", "compass",
      "cookie", "cookie-bite", "copy", "cube", "cubes", "cut", "dice", "dice-d20", "dice-d6",
      "dice-five", "dice-four", "dice-one", "dice-six", "dice-three", "dice-two",
      "digital-tachograph", "door-closed", "door-open", "drum", "drum-steelpan", "envelope",
      "envelope-open", "eraser", "eye", "eye-dropper", "fax", "feather", "feather-alt",
      "fighter-jet", "file", "file-alt", "file-prescription", "film", "fire", "fire-alt",
      "fire-extinguisher", "flag", "flag-checkered", "flask", "futbol", "gamepad", "gavel",
      "gem", "gift", "gifts", "glass-cheers", "glass-martini", "glass-whiskey", "glasses",
      "globe", "graduation-cap", "guitar", "hat-wizard", "hdd", "headphones",
      "headphones-alt", "headset", "heart", "heart-broken", "helicopter", "highlighter",
      "holly-berry", "home", "hospital", "hourglass", "igloo", "image", "images", "industry",
      "key", "keyboard", "laptop", "leaf", "lemon", "life-ring", "lightbulb", "lock",
      "lock-open", "magic", "magnet", "map", "map-marker", "map-marker-alt", "map-pin",
      "map-signs", "marker", "medal", "medkit", "memory", "microchip", "microphone",
      "microphone-alt", "mitten", "mobile", "mobile-alt", "money-bill", "money-bill-alt",
      "money-check", "money-check-alt", "moon", "motorcycle", "mug-hot", "newspaper",
      "paint-brush", "paper-plane", "paperclip", "paste", "paw", "pen", "pen-alt",
      "pen-fancy", "pen-nib", "pencil-alt", "phone", "phone-alt", "plane", "plug", "print",
      "puzzle-piece", "ring", "road", "rocket", "ruler-combined", "ruler-horizontal",
      "ruler-vertical", "satellite", "satellite-dish", "save", "school", "screwdriver",
      "scroll", "sd-card", "search", "shield-alt", "shopping-bag", "shopping-basket",
      "shopping-cart", "shower", "sim-card", "skull-crossbones", "sleigh", "snowflake",
      "snowplow", "space-shuttle", "star", "sticky-note", "stopwatch", "stroopwafel",
      "subway", "suitcase", "sun", "tablet", "tablet-alt", "tachometer-alt", "tag", "tags",
      "taxi", "thumbtack", "ticket-alt", "toilet", "toolbox", "tools", "train", "tram",
      "trash", "trash-alt", "tree", "trophy", "truck", "tv", "umbrella", "university",
      "unlock", "unlock-alt", "utensil-spoon", "utensils", "wallet", "weight", "wheelchair",
      "wine-glass", "wrench"
    ],
    "Sports": [
      "baseball-ball", "basketball-ball", "biking", "bowling-ball", "dumbbell",
      "football-ball", "futbol", "golf-ball", "hockey-puck", "quidditch", "running",
      "skating", "skiing", "skiing-nordic", "snowboarding", "swimmer", "table-tennis",
      "volleyball-ball"
    ],
    "Travel": [
      "archway", "atlas", "bed", "bus", "bus-alt", "cocktail", "concierge-bell", "dumbbell",
      "glass-martini", "glass-martini-alt", "globe-africa", "globe-americas", "globe-asia",
      "globe-europe", "hot-tub", "hotel", "luggage-cart", "map", "map-marked",
      "map-marked-alt", "monument", "passport", "plane", "plane-arrival", "plane-departure",
      "shuttle-van", "spa", "suitcase", "suitcase-rolling", "swimmer", "swimming-pool",
      "taxi", "tram", "tv", "umbrella-beach", "wine-glass", "wine-glass-alt"
    ],
    "Users & People": [
      "accessible-icon", "address-book", "address-card", "baby", "bed", "biking", "blind",
      "chalkboard-teacher", "child", "female", "frown", "hiking", "id-badge", "id-card",
      "id-card-alt", "male", "meh", "people-carry", "person-booth", "poo", "portrait",
      "power-off", "pray", "restroom", "running", "skating", "skiing", "skiing-nordic",
      "smile", "snowboarding", "street-view", "swimmer", "user", "user-alt", "user-alt-slash",
      "user-astronaut", "user-check", "user-circle", "user-clock", "user-cog", "user-edit",
      "user-friends", "user-graduate", "user-injured", "user-lock", "user-md", "user-minus",
      "user-ninja", "user-nurse", "user-plus", "user-secret", "user-shield", "user-slash",
      "user-tag", "user-tie", "user-times", "users", "users-cog", "walking", "wheelchair"
    ],
    "Weather": [
      "bolt", "cloud", "cloud-meatball", "cloud-moon", "cloud-moon-rain", "cloud-rain",
      "cloud-showers-heavy", "cloud-sun", "cloud-sun-rain", "meteor", "moon", "poo-storm",
      "rainbow", "smog", "snowflake", "sun", "temperature-high", "temperature-low",
      "umbrella", "water", "wind"
    ]
  };

  // 合并所有分类
  const allCategories = { ...webpageIconData, ...additionalCategories };

  // 品牌图标列表（从Brand Icons分类中获取）
  const brandIcons = new Set(allCategories["Brand Icons"] || []);

  // 创建图标数据
  const icons = [];
  const iconSet = new Set();

  // 处理所有分类中的图标
  Object.entries(allCategories).forEach(([categoryName, iconNames]) => {
    iconNames.forEach(iconName => {
      const className = `la-${iconName}`;
      
      // 避免重复
      if (!iconSet.has(className)) {
        iconSet.add(className);

        // 确定是否为品牌图标
        const isBrand = brandIcons.has(iconName);
        const iconPrefix = isBrand ? 'lab' : 'las';

        const iconData = {
          name: formatIconName(iconName),
          class: `${iconPrefix} ${className}`,
          className: className,
          unicode: '', // 暂时留空
          variants: [iconPrefix],
          isBrand: isBrand,
          category: categoryName
        };

        icons.push(iconData);
      }
    });
  });

  // 按名称排序
  icons.sort((a, b) => a.name.localeCompare(b.name));

  // 创建分类数据
  const categories = {};
  Object.entries(allCategories).forEach(([categoryName, iconNames]) => {
    const categoryKey = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
    categories[categoryKey] = icons.filter(icon => icon.category === categoryName);
  });

  // 创建输出数据
  const outputData = {
    metadata: {
      source: 'Line Awesome Website',
      version: '1.3.0',
      totalIcons: icons.length,
      extractedAt: new Date().toISOString(),
      description: 'Line Awesome图标类名列表，从官方网站提取',
      url: 'https://icons8.com/line-awesome'
    },
    icons: icons,
    categories: categories,
    variants: ['las', 'lar', 'lab', 'lad', 'lal']
  };

  return outputData;
}

/**
 * 格式化图标名称
 */
function formatIconName(iconName) {
  return iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * 导出到JSON文件
 */
function exportToJson() {
  const outputDir = path.join(__dirname, '../dist/icons');
  const outputFilePath = path.join(outputDir, 'line-awesome-classes.json');

  try {
    console.log('开始解析Line Awesome网页数据...');
    
    const iconData = parseLineAwesomeWebpage();

    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入JSON文件
    fs.writeFileSync(outputFilePath, JSON.stringify(iconData, null, 2), 'utf8');

    console.log(`✅ 成功导出 ${iconData.icons.length} 个图标到 ${outputFilePath}`);
    
    // 显示统计信息
    console.log('\n📊 统计信息:');
    console.log(`- 总图标数: ${iconData.icons.length}`);
    console.log(`- 品牌图标数: ${iconData.icons.filter(icon => icon.isBrand).length}`);
    console.log(`- 常规图标数: ${iconData.icons.filter(icon => !icon.isBrand).length}`);
    console.log(`- 分类数: ${Object.keys(iconData.categories).length}`);

    // 显示前10个图标作为示例
    console.log('\n🎨 示例图标:');
    iconData.icons.slice(0, 10).forEach(icon => {
      console.log(`  - ${icon.name} (${icon.class})`);
    });

    return iconData;

  } catch (error) {
    console.error('❌ 导出图标时发生错误:', error.message);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  try {
    exportToJson();
  } catch (error) {
    console.error('脚本执行失败:', error);
    process.exit(1);
  }
}

module.exports = { parseLineAwesomeWebpage, exportToJson };