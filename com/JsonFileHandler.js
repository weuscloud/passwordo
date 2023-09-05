const fs = require('fs');
const log = require('./log');

class JsonFileHandler {
  constructor(filePath) {
    this.filePath = filePath;
  }

  // 读取JSON文件
  read() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, 'utf-8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            // 文件不存在，返回空对象
            resolve({});
          } else {
            reject(err);
          }
        } else {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (parseErr) {
            resolve({});
            log('WARNING',__filename,'user.json文件内容不正确');
          }
        }
      });
    });
  }

  // 写入JSON文件
  write(data) {
    return new Promise((resolve, reject) => {
      const jsonString = JSON.stringify(data, null, 2); // 缩进使JSON更易读
      fs.writeFile(this.filePath, jsonString, 'utf-8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // 更新特定属性
  update(propertyName, value) {
    return this.read()
      .then((jsonData) => {
        jsonData[propertyName] = value;
        return this.write(jsonData);
      });
  }

  // 读取特定属性的值
  async getValue(propertyName) {
    const jsonData=await this.read()
    if (jsonData.hasOwnProperty(propertyName)) {
      return jsonData[propertyName];
    } else {
      throw new Error(`属性 ${propertyName} 不存在`);
    }
  }
}
module.exports = JsonFileHandler