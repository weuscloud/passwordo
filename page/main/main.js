const { ipcRenderer } = require("electron");
const { debounce } = require("../../com/throttle");
const Notification = require("../com/notification");
function addItems(content) {
  if (!content instanceof Array) {
    Notification.getInstance().show("Load failed","error");
    return;
  }
  if(content.length==0){
    Notification.getInstance().show("目前还没有账号！","warning");
    return;
  };
  //清空
  const dropdownBtn = document.querySelector(".dropdown-items");
  dropdownBtn.textContent = "";
  const dropdown = document.querySelector(".dropdown");

  // 创建下拉项容器
  const itemsContainer = document.createElement("div");
  itemsContainer.classList.add("dropdown-items");

  // 遍历内容数组创建下拉项
  for (let i = 0; i < content.length; i++) {
    const item = document.createElement("a");
    item.classList.add("dropdown-item");
    item.textContent = content[i];
    item.idx = i;
    itemsContainer.appendChild(item);
  }

  // 将下拉项容器添加到父元素中
  dropdown.appendChild(itemsContainer);
}

const Looper = {
  isLoop: false,
  isAccount:true,
};


Object.defineProperty(Looper, 'isAccount', {
  get() {
    return isAccount;
  },
  set(newValue) {
    if(newValue===false&&Looper.isLoop){
      //复制密码后
      let uids = document.querySelectorAll(".dropdown-item");
      //模拟一次点击
      let cur=document.querySelector(".dropdown-btn").idx;
      cur++;
      if(0<=cur&&cur<uids.length){
        document.querySelector(".dropdown-btn").idx=cur;
        uids[cur].click();
      }else{
        document.querySelector(".dropdown-btn").idx=0
      }
    }
    isAccount = newValue;
  },
  enumerable: true,
  configurable: true,
});

const menu = document.querySelector(".menu");
function loopItems() {
  
  
}
menu.addEventListener(
  "click",
  debounce(function (event) {
    const target = event.target;
    // 如果点击的是下拉列表中的某个选项
    if (target.classList.contains("dropdown-item")) {
      // 处理选项被点击后的逻辑
      Looper.uid = target.innerText;
      //更新显示uid内容
      document.querySelector(".dropdown-btn").textContent = Looper.uid;
      //更新当前元素下标
      document.querySelector(".dropdown-btn").idx = target.idx;
    } else if (target.classList.contains("account")) {
      if (Looper.uid) {
        Looper.isAccount = true;
        ipcRenderer.send("clipboard-copy", {
          uid: Looper.uid,
          isAccount: Looper.isAccount,
        });
      } else {
        Notification.getInstance().show("请选择账号!", "warning");
      }
    } else if (target.classList.contains("password")) {
      if (Looper.uid) {
        Looper.isAccount = false;
        ipcRenderer.send("clipboard-copy", {
          uid: Looper.uid,
          isAccount: Looper.isAccount,
        });
      } else {
        Notification.getInstance().show("请选择账号!", "warning");
      }
    } else if (target.classList.contains("loop")) {
      target.classList.toggle("is-loop");
      Looper.isLoop = !Looper.isLoop;
    } else if (target.classList.contains("manage")) {
      ipcRenderer.send("go-to", "manage");
    }
  }, 100)
);
ipcRenderer.on("clipboard-copy-reply", (event, arg) => {
  const { success, isAccount,uid } = arg;
  let message=`复制${isAccount?"账号":"密码"}${success?"成功":"失败"}\nuid:${uid}`;
  if (success === true) {
    Notification.getInstance().show(message, "success");
  } else {
    Notification.getInstance().show(message, "warning");
  }
});
//查询所有uid;
ipcRenderer.send("query-uid", "");
ipcRenderer.on("query-uid-reply", (event, arg) => {
  addItems(arg);
});
