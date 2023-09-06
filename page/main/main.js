const { ipcRenderer } = require("electron");
const { debounce } = require("../../com/throttle");
const Notification = require("../com/notification");
const Translator = require("../com/Translator");

function addItems(content) {
  if (!content instanceof Array) {
    Notification.getInstance().show("{LoadUIDListFailed}", "error");
    return;
  }
  if (content.length == 0) {
    Notification.getInstance().show("{PLSELECTUID}", "warning");
    return;
  }
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
  isAccount: true,
};

Object.defineProperty(Looper, "isAccount", {
  get() {
    return isAccount;
  },
  set(newValue) {
    if (newValue === false && Looper.isLoop) {
      //复制密码后
      let uids = document.querySelectorAll(".dropdown-item");
      //模拟一次点击
      let cur = document.querySelector(".dropdown-btn").idx;
      cur++;
      if (0 <= cur && cur < uids.length) {
        document.querySelector(".dropdown-btn").idx = cur;
        uids[cur].click();
      } else {
        document.querySelector(".dropdown-btn").idx = 0;
      }
    }
    isAccount = newValue;
  },
  enumerable: true,
  configurable: true,
});

const menu0 = document.querySelector(".menu0");
menu0.addEventListener("click", debounce(handleMenuClick, 200));

const menu1 = document.querySelector(".menu1");
menu1.addEventListener("click", debounce(handleMenuClick, 200));

const classToHandlerMap = {
  "dropdown-item": handleDropdownItemClick,
  "account": handleAccountClick,
  "password": handlePasswordClick,
  "loop": handleLoopClick,
  "manage": handleManageClick,
  "cleareg": handleClearRegClick,
  "startgenshin": handlerStartGenshin,
};

function handlerStartGenshin(event) {
  ipcRenderer.send('start-genshin','');
}

function handleMenuClick(event) {
  const target = event.target;

  target.classList.forEach(className => {
    const handler = classToHandlerMap[className];
    //console.log('click', className, handler);

    if (handler) {
      handler(target);
    }
  });
}
function handleDropdownItemClick(target) {
  Looper.uid = target.innerText;
  document.querySelector(".dropdown-btn").textContent = Looper.uid;
  document.querySelector(".dropdown-btn").idx = target.idx;
}

function handleAccountClick() {
  if (Looper.uid) {
    Looper.isAccount = true;
    ipcRenderer.send("clipboard-copy", {
      uid: Looper.uid,
      isAccount: Looper.isAccount,
    });
  } else {
    Notification.getInstance().show("{PLSELECTUID}", "warning");
  }
}

function handlePasswordClick() {
  if (Looper.uid) {
    Looper.isAccount = false;
    ipcRenderer.send("clipboard-copy", {
      uid: Looper.uid,
      isAccount: Looper.isAccount,
    });
  } else {
    Notification.getInstance().show("{PLSELECTUID}", "warning");
  }
}

function handleLoopClick(target) {
  target.classList.toggle("is-loop");
  Looper.isLoop = !Looper.isLoop;
}

function handleManageClick() {
  ipcRenderer.send("go-to", "manage");
}

function handleClearRegClick() {
  ipcRenderer.send("cleareg", "");
}

ipcRenderer.on("clipboard-copy-reply", (event, arg) => {
  const { success, isAccount, uid } = arg;
  let message = `{copy}${isAccount ? "{account}" : "{password}"}${success ? "{successed}" : "{failed}"
    }\nuid:${uid}`;
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

//翻译
// 发送消息给主进程请求语言数据

ipcRenderer.on("cleareg-reply", (e, arg) => {
  const { success, message } = arg;
  Notification.getInstance().show(message, success ? "success" : "error");
})
