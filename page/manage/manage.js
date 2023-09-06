const Notification = require("../com/notification");
const { ipcRenderer } = require("electron");
const { throttle, debounce } = require("../../com/throttle");
const Translator = require("../com/Translator");
// 监听container元素中的点击事件
let table = document.querySelector(".container");
const tbFormat = {
  uid: "",
  account: "",
  password: "",
  tips: "",
  action: "delete",
};

function add(other) {
  if (typeof other !== "object") return;
  // 创建新的行元素
  let row = document.createElement("div");
  row.classList.add("row");
  row.classList.add("line");

  Object.keys(other).forEach((key) => {
    let col = document.createElement("div");
    col.classList.add("col");
    col.classList.add(key);
    if (typeof other[key] === "string") {
      if (key === "password") {
        col.textContent = "••••••••••••";
        col.trueText = other[key];
      } else if (key === "action" && typeof other[key] === "string") {
        const translator = new Translator(window.g_langData);

        let ops = other[key].split(",");
        ops.forEach((item) => {
          let submitButton = document.createElement("button");
          submitButton.type = item;
          submitButton.textContent = `{${item}}`;
          col.appendChild(submitButton);
          if (window.g_langData) {
            translator.translateElement(submitButton);
          }
        });
      } else {
        col.textContent = other[key];
      }
    }
    row.appendChild(col);
  });

  document.querySelector(".container").appendChild(row);
}
function addHeader(obj) {
  let row = document.createElement("div");
  row.classList.add("row", "header");

  Object.keys(obj).forEach((key) => {
    let col = document.createElement("div");
    col.classList.add("col", key);
    col.textContent = `{${key}}`;
    if (window.g_langData) {
      const translator = new Translator(window.g_langData);
      translator.translateElement(col);
    }
    row.appendChild(col);
  });
  //翻译

  document.querySelector(".container").appendChild(row);
}
//将数据按tbformat中key的顺序传递
function sortKey(data) {
  if (typeof data != "object") throw "typeError;sortKey;;";
  const next = { ...tbFormat };
  Object.keys(next).forEach((key) => {
    if (key !== "action") next[key] = data[key] || "";
  });
  //添加表头
  if (!window.headerCreated) {
    window.headerCreated = true;
    addHeader(next);
  }
  //为后续添加行准备key顺序
  return next;
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
              const account = row.querySelector(".account").textContent;
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
    Notification.getInstance().shoWithUid(uid, "success", "{ModifySuccessed}");
  } else {
    Notification.getInstance().shoWithUid(uid, "error", "{ModifyFailed}");
  }
});

//删除操作
ipcRenderer.on("delete-account-reply", (event, arg) => {
  const { success, uid } = arg;
  if (success === true)
    Notification.getInstance().shoWithUid(uid, "success", "{delete}{successed}");
  else {
    Notification.getInstance().shoWithUid(uid, "success", "{delete}{Failed}");
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
function getRowData(target) {
  // 找到目标按钮所在的行元素
  const row = target.closest(".row");
  // 删除该行元素
  if (row) {
    const uid = row.querySelector(".uid").textContent;
  }
}
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
    Notification.getInstance().show("{SaveDoc}{successed}", "success");
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

ipcRenderer.on("query-account-reply", (event, arg) => {
  //删除原先元素
  const lines = document.querySelectorAll("div.line");
  lines.forEach((line) => {
    line.parentNode.removeChild(line);
  });
  const data = arg;
  if (data instanceof Array) {
    for (const d of data) {
      add(sortKey(d));
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
      formContainer.querySelector("#uid").value = randomNum;
      toggleModal();
    } else if (target.getAttribute("type") === "import") {
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
  const { success, message, uid } = arg;
  if (success === true) {
    Notification.getInstance().shoWithUid(uid, "success", "{NewAccount}{create}{successed}");
    add(sortKey(arg));
    toggleModal();
  } else {
    Notification.getInstance().shoWithUid(uid, "error", "{NewAccount}{create}{failed}", message);
  }
});

//导入功能
ipcRenderer.on("import-account-reply", (e, arg) => {
  const { message, success, accounts } = arg;
  if (success) {
    Notification.getInstance().show('{import}{successed}', "success");
    if (accounts instanceof Array) {
      let index = 0;
      const addRowAsync = () => {
        if (index < accounts.length) {
          add(accounts[index]);
          index++;
          setTimeout(addRowAsync, 100);
        }
      };
      addRowAsync();
    }
  } else {
    Notification.getInstance().show("{import}{failed}" + message, "error");
  }
});
ipcRenderer.send("query-account", "");