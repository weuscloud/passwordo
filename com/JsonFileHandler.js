const fs = require('fs');

const log = require('./log')||console.log;

class JsonFileHandler {
  constructor(filePath) {
    this.filePath = filePath;
    this._jsonData=this.read();
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
        log('WARNING', __filename, '配置文件内容不正确',parseErr);
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
    } else{
      throw `属性${propertyName}不存在`;
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
module.exports = JsonFileHandler;
