const fs = require('fs');
const readline = require('readline');

class JsonFileHandler {
  constructor(filePath,logger) {
    this.filePath = filePath;
    this._jsonData=this.read();
    this._logger=logger||console.log;
  }

  // 读取JSON文件
  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      try {
        let jsonData = JSON.parse(data);
        jsonData=this.toLowerCase(jsonData);
        this._jsonData=jsonData;
        return jsonData;
      } catch (parseErr) {
        _logger('WARNING', __filename, '配置文件内容不正确',parseErr);
        this._jsonData={};
        return {};
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        this._jsonData={};
        return {};
      } else {
        throw err;
      }
    }
  }
  toLowerCase(data){
    let obj={}
    for (const [key, value] of Object.entries(data)) {
      obj[key.toLowerCase()] = value;
    }
    return obj
  }
  // 写入JSON文件
  write() {
    const jsonString = JSON.stringify(this._jsonData, null, 2); // 缩进使JSON更易读
    fs.writeFileSync(this.filePath, jsonString, 'utf-8');
  }

  // 更新特定属性
  update(propertyName, value) {
    propertyName=propertyName.toLowerCase();
    this._jsonData[propertyName] = value;
    this.write();
  }

  // 读取特定属性的值
  getValue(propertyName) {
    propertyName=propertyName.toLowerCase();

    if (this._jsonData.hasOwnProperty(propertyName)) {
      return this._jsonData[propertyName];
    } else {
      throw new Error(`属性 ${propertyName} 不存在`);
    }
  }
  getKeys(){
    let keys=[]
    for (let key in this._jsonData) {
    keys.push(key)
    }
    return keys
  }
  setPath(path){
    this.filePath=path;
  }
  getJsonData(){
    return this._jsonData
  }
  setJsonData(data){
    this._jsonData=this.toLowerCase(data)
  }
}
function deepMerge(oldObj, newObj,forceChanged=false) {
  if (typeof oldObj !== 'object' || typeof newObj !== 'object') {
    return {};
  }

  const result = { ...oldObj };

  for (const key in newObj) {
    if (newObj.hasOwnProperty(key)) {
      if (typeof newObj[key] === 'object' && oldObj.hasOwnProperty(key) && typeof oldObj[key] === 'object') {
        result[key] = deepMerge(oldObj[key], newObj[key]);
      } else {
        const oldVal=typeof oldObj[key]==='string'?oldObj[key]:'';
        result[key] = forceChanged?newObj[key]:oldVal;
      }
    }
  }

  return result;
}
function compareObjectsKeys(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const uniqueKeys1 = keys1.filter(key => !keys2.includes(key));
  const uniqueKeys2 = keys2.filter(key => !keys1.includes(key));

  return [...uniqueKeys1, ...uniqueKeys2];
}
const handlerzh=new JsonFileHandler('./locales/zh.json')
const zhLen=handlerzh.getKeys().length

const handleren=new JsonFileHandler('./locales/en.json')
const enLen=handleren.getKeys().length

const handler=new JsonFileHandler('./locales/en.json')
handler.setJsonData(deepMerge(handleren.getJsonData(),handlerzh.getJsonData()))
const tLen=handler.getKeys().length

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const diff=compareObjectsKeys(handleren._jsonData,handlerzh._jsonData)

console.log(`两者差异${diff.length}个key如下：\n`,diff)

rl.question(`合并后key的数量匹配？(y/n) --对象1(${zhLen})keys,对象2(${enLen})keys,新对象(${tLen})keys.\n`, (answer) => {
  if (answer.toLowerCase() === 'y') {
    console.log('用户确认了！');
    // 在这里执行你的操作
    handler.write();
    console.log('写入结束。');
  } else if (answer.toLowerCase() === 'n') {
    console.log('用户取消了。');
  } else {
    console.log('无效的回答，请输入 "y" 或 "n"。');
  }
  rl.close();
});