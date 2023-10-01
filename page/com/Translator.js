const { ipcRenderer } = require("electron");
class Translator {
  constructor(langData) {

    this.langData = {};
    for (const [key, value] of Object.entries(langData)) {
      this.langData[key.toLowerCase()] = value;
    }
  }

  // 翻译一个文本节点
  translateTextNode(node) {
    const key = node.nodeValue.trim();
    const match = key.match(/\{(.+?)\}/); // 匹配{}中的文本
    if (match) {
      const matchKey = match[1].trim().toLowerCase(); // 将{}中的文本转换为小写形式
      const value = this.langData[matchKey];
      if (value) {
        node.nodeValue = key.replace(match[0], value); // 用翻译值替换原始文本中的{}
      } else {
        node.nodeValue = key.replace(/\{(.+?)\}/, matchKey); // 没有匹配到翻译值，则将key作为内容
      }
    }
  }
  translate(key) {
    const match = key.match(/\{(.+?)\}/); // 匹配{}中的文本
    if (match) {
      const matchKey = match[1].trim().toLowerCase(); // 将{}中的文本转换为小写形式
      const value = this.langData[matchKey];
      if (value) {
        return key.replace(match[0], value); // 用翻译值替换原始文本中的{}
      } else {
        return key.replace(/\{(.+?)\}/, matchKey); // 没有匹配到翻译值，则将key作为内容
      }
    }
  }
  translateElement(element) {
    const childNodes = element.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const node = childNodes[i];
      if (node.nodeType === Node.ELEMENT_NODE) {
        // 翻译元素节点属性
        const attributes = node.attributes;
        for (let j = 0; j < attributes.length; j++) {
          const attr = attributes[j];
          const key = attr.value.trim();
          const match = key.match(/\{(.+?)\}/); // 匹配{}中的文本
          if (match) {
            const matchKey = match[1].trim().toLowerCase(); // 将{}中的文本转换为小写形式
            const value = this.langData[matchKey];
            if (value) {
              node.setAttribute(attr.name, key.replace(match[0], value)); // 用翻译值替换属性值中的{}
            } else {
              node.setAttribute(attr.name, key.replace(/\{(.+?)\}/, matchKey)); // 没有匹配到翻译值，则将key作为属性值
            }
          }
        }
        // 翻译元素节点文本
        this.translateElement(node);
      } else if (node.nodeType === Node.TEXT_NODE) {
        // 翻译文本节点
        this.translateTextNode(node);
      }
    }
  }

  // 翻译整个页面
  translatePage() {
    this.translateElement(document);
  }
}
ipcRenderer.on("get-lang-data-reply", (e, arg) => {
  const { success, langData } = arg;
  if (success === true) {
    window.g_langData =  {};
    for (const [key, value] of Object.entries(langData)) {
      window.g_langData[key.toLowerCase()] = value;
    }
    new Translator(window.g_langData).translatePage();
  }
});
ipcRenderer.on("reload",(e,a)=>{
  location.reload();
})
ipcRenderer.send("get-lang-data", { lang: navigator.language });
module.exports = Translator;
