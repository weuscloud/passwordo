const fs = require('fs');
const log = require('./log');

class JsonFileHandler {
  constructor(filePath) {
    this.filePath = filePath;
  }

  // 读取JSON文件
  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      try {
        let jsonData = JSON.parse(data);
        jsonData=this.toLowerCase(jsonData);
        return jsonData;
      } catch (parseErr) {
        log('WARNING', __filename, '解析文件失败',parseErr);
        return {};
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在，返回空对象
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
  write(data) {
    data=this.toLowerCase(data);
    const jsonString = JSON.stringify(data, null, 2); // 缩进使JSON更易读
    fs.writeFileSync(this.filePath, jsonString, 'utf-8');
  }

  // 更新特定属性
  update(propertyName, value) {
    propertyName=propertyName.toLowerCase();
    let jsonData = this.read();
    jsonData[propertyName] = value;
    this.write(jsonData);
  }

  // 读取特定属性的值
  getValue(propertyName) {
    propertyName=propertyName.toLowerCase();
    const jsonData = this.read();
    if (jsonData.hasOwnProperty(propertyName)) {
      return jsonData[propertyName];
    } else {
      throw new Error(`属性 ${propertyName} 不存在`);
    }
  }
}
module.exports = JsonFileHandler;
