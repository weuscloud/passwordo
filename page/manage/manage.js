const Notification = require("../com/notification");
const { ipcRenderer } = require("electron");
const { throttle, debounce } = require("../../com/throttle");
const Translator = require("../com/Translator");
// 监听container元素中的点击事件
let table = document.querySelector(".container");

function addRow({ uid, account, password, tips }) {
  // 获取表格元素
  var table = document.querySelector(".container");

  // 创建新的行元素
  var row = document.createElement("div");
  row.classList.add("row");
  row.classList.add("line");

  // 创建新的UID元素
  var uidCol = document.createElement("div");
  uidCol.classList.add("col", "uid");
  uidCol.textContent = uid;

  // 创建新的账号元素
  var accountCol = document.createElement("div");
  accountCol.classList.add("col", "account");
  accountCol.textContent = "••••••••••••";
  accountCol.trueText = account;

  // 创建新的密码元素
  var passwordCol = document.createElement("div");
  passwordCol.classList.add("col", "password");
  passwordCol.textContent = "••••••••••••";
  passwordCol.trueText = password;

  // 创建新的备注元素
  var tipsCol = document.createElement("div");
  tipsCol.classList.add("col", "tips");
  tipsCol.textContent = tips;

  // 创建新的操作按钮元素
  var actionCol = document.createElement("div");
  actionCol.classList.add("col", "action");
  var submitButton = document.createElement("button");
  submitButton.type = "delete";
  submitButton.textContent = "{delete}";
  actionCol.appendChild(submitButton);

  // 将新的列添加到行中
  row.appendChild(uidCol);
  row.appendChild(accountCol);
  row.appendChild(passwordCol);
  row.appendChild(tipsCol);
  row.appendChild(actionCol);

  // 将新的行添加到表格中
  table.appendChild(row);
}
//编辑操作
table.addEventListener(
  "dblclick",
  debounce((event) => {
    // 获取用户点击的元素
    var target = event.target;
    // 判断点击的元素
    if (
      target.classList.contains("col") &&
      !target.classList.contains("action") &&
      !target.classList.contains("uid") &&
      !target.parentNode.classList.contains("header")
    ) {
      // 将div元素替换为input元素
      var input = document.createElement("input");
      input.style.width = "100%";
      input.style.borderRadius = "2px";
      input.type = "text";
      input.value = target.trueText || target.textContent;
      target.textContent = "";
      target.appendChild(input);

      input.addEventListener(
        "change",
        throttle(() => {
          const row = target.closest(".row");
          // 删除该行元素
          if (row) {
            setTimeout(() => {
              const uid = row.querySelector(".uid").textContent;
              const account = row.querySelector(".account").trueText;
              const password = row.querySelector(".password").trueText;
              const tips = row.querySelector(".tips").textContent;
              ipcRenderer.send("modify-account", {
                uid,
                account,
                password,
                tips,
              });
            }, 200);
          }
        }, 1000)
      );
      //失去焦点的1秒内销毁
      input.addEventListener(
        "blur",
        debounce((event) => {
          if (target.trueText) {
            target.trueText = input.value;
            target.textContent = "••••••••••••";
          } else {
            target.textContent = input.value;
          }
        }, 100)
      );
      //3秒内没有输入则恢复
      input.addEventListener(
        "keydown",
        debounce((event) => {
          if (target.trueText) {
            target.trueText = input.value;
            target.textContent = "••••••••••••";
          } else {
            target.textContent = input.value;
          }
        }, 5000)
      );
    }
  }, 100)
);
ipcRenderer.on("modify-account-reply", (event, arg) => {
  const { success, message, uid } = arg;
  if (success === true) {
    Notification.getInstance().shoWithUid(uid, "success", "修改成功");
  } else {
    Notification.getInstance().shoWithUid(uid, "error", "修改失败");
  }
});

//删除操作
ipcRenderer.on("delete-account-reply", (event, arg) => {
  const { success, uid } = arg;
  if (success === true)
    Notification.getInstance().shoWithUid(uid, "success", "删除成功");
  else {
    Notification.getInstance().shoWithUid(uid, "success", "删除成功");
  }
});
table.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    // 判断目标元素是否为delete按钮
    if (
      target.tagName.toLowerCase() === "button" &&
      target.getAttribute("type") === "delete"
    ) {
      // 找到目标按钮所在的行元素
      const row = target.closest(".row");
      // 删除该行元素
      if (row) {
        setTimeout(() => {
          const uid = row.querySelector(".uid").textContent;
          ipcRenderer.send("delete-account", { uid });
          row.remove();
        }, 200);
      }
    }
  }, 1000)
);

//保存按钮
table.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    // 判断目标元素是否为delete按钮
    if (
      target.tagName.toLowerCase() === "button" &&
      target.getAttribute("type") === "save"
    ) {
      ipcRenderer.send("save-account", "");
    }
  }, 1000)
);
ipcRenderer.on("save-account-reply", (event, arg) => {
  const { success, message } = arg;
  if (success === true) {
    Notification.getInstance().show("保存成功!", "success");
  } else {
    Notification.getInstance().show(message, "error");
  }
});

//主页按钮
table.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    // 判断目标元素是否为delete按钮
    if (
      target.tagName.toLowerCase() === "button" &&
      target.getAttribute("type") === "back"
    ) {
      ipcRenderer.send("go-to", "main");
    }
  }, 1000)
);

//查询操作
ipcRenderer.send("query-account", "");
ipcRenderer.on("query-account-reply", (event, arg) => {
  //删除原先元素
  const lines = document.querySelectorAll("div.line");
  lines.forEach((line) => {
    line.parentNode.removeChild(line);
  });
  const data = arg;
  if (data instanceof Array) {
    for (const d of data) {
      addRow(d);
    }
  }
});

//新建功能
function toggleModal() {
  document.querySelector(".modal").classList.toggle("close");
}
const formContainer = document.querySelector(".form-container");
//提交表单
formContainer.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    // 判断目标元素是否为cancel按钮
    if (target.tagName.toLowerCase() === "button") {
      if (target.getAttribute("type") === "cancel") {
        toggleModal();
        return;
      }
      if (target.getAttribute("type") === "submit") {
        // 获取表单数据
        setTimeout(() => {
          const uid = formContainer.querySelector("#uid").value;
          const account = formContainer.querySelector("#account").value;
          const password = formContainer.querySelector("#password").value;
          const tips = formContainer.querySelector("#tips").value;
          ipcRenderer.send("create-account", { uid, account, password, tips });
        }, 200);
        return;
      }
    }
  }, 1000)
);
//打开modal
table.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    // 判断目标元素是否为新建按钮
    if (
      target.tagName.toLowerCase() === "button" &&
      target.getAttribute("type") === "new"
    ) {
      //打开modal
      const randomNum = Math.floor(Math.random() * 900000000 + 100000000);
      formContainer.querySelector("#uid").value=randomNum;
      toggleModal();
    }
   else if (target.getAttribute("type") === "import") {
      console.log("import");
      ipcRenderer.send("import-account", "");
    }
  }, 1000)
);
//点击外部区域关闭modal
const formOverlay = document.querySelector(".modal-container");
formOverlay.addEventListener("click", (event) => {
  toggleModal();
});

ipcRenderer.on("create-account-reply", (event, arg) => {
  const { success, uid, message } = arg;
  if (success === true) {
    Notification.getInstance().shoWithUid(uid, "success", "创建成功");
    addRow(arg);
    toggleModal();
  } else {
    Notification.getInstance().shoWithUid(uid, "error", "创建失败", message);
  }
});

//导入功能
ipcRenderer.on("import-account-reply", (e, arg) => {
  const { message, success, accounts } = arg;
  if (success) {
    Notification.getInstance().show("导入成功", "success");
    if (accounts instanceof Array) {
      let index = 0;
      const addRowAsync = () => {
        if (index < accounts.length) {
          addRow(accounts[index]);
          index++;
          setTimeout(addRowAsync, 100);
        }
      };
      addRowAsync();
    }
    
  } else {
    Notification.getInstance().show("导入失败\m"+message, "error");
  }
});

//翻译
// 发送消息给主进程请求语言数据
ipcRenderer.send("get-lang-data");
ipcRenderer.on("get-lang-data-reply", (e, arg) => {
  const { success, langData } = arg;
  console.log(success);
  if (success === true) {
    const translator = new Translator(langData);
    translator.translatePage();
  }
});
