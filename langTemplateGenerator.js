const fs = require('fs');
const path = require('path');
const targetLang='en';
const localesDir = path.join(__dirname, 'locales');
const targetLangFile = path.join(localesDir, `${targetLang}.json`);

// 遍历 locales 目录下的所有语言文件
const targetLangData = {};
fs.readdirSync(localesDir).forEach(file => {
  if (path.extname(file) !== '.json') return; // 过滤非 JSON 文件
  const langFilePath = path.join(localesDir, file);
  const langData = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));

  // 将语言文件中的 key 和 value 合并到目标语言模板中
  for (const key in langData) {
    if (targetLangData[key] === undefined) {
      targetLangData[key] = '';
    } else {
      console.warn(`目标语言模板中已存在 key "${key}"，将保留原值 "${targetLangData[key]}"`);
    }
  }
  
});

// 写入目标语言文件
fs.writeFileSync(targetLangFile, JSON.stringify(targetLangData, null, 2), 'utf8');

console.log(`语言模板 ${targetLangFile} 生成成功！`);
