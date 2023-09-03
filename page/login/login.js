// renderer.js
const { ipcRenderer } = require("electron");
const Notification = require("../com/notification");
const { throttle } = require("../../com/throttle");
const Translator = require("../com/Translator");
const loginForm = document.getElementById("login-form");
loginForm.addEventListener(
  "submit",
  throttle((event) => {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    ipcRenderer.send("login-form-submission", { username, password });
  }, 1000)
);

//重置功能
loginForm.addEventListener(
  "click",
  throttle((event) => {
    const target = event.target;
    if (
      target.tagName.toLowerCase() === "button" &&
      target.getAttribute("type") === "reset"
    ) {
      if (target.hasClicked === 1) {
        ipcRenderer.send("reset-password", "");
        target.hasClicked++;
      } else if (!target.hasClicked) {
        Notification.getInstance().show(
          "警告:你正在重置密码,所有信息无法找回!\n确认请继续点击!",
          "warning"
        );
        target.hasClicked = 1;
      }
    }
  }, 1000)
);
ipcRenderer.on("reset-password-reply", (e, a) => {
  const { success } = a;
  if (success) {
    Notification.getInstance().show("重置成功!", "success");
    return;
  }
  Notification.getInstance().show("重置失败!", "error");
});

ipcRenderer.on("login-error", (event, arg) => {
  const { success, message } = arg;
  Notification.getInstance().show(message, "error");
});

const input = loginForm.querySelector("#username");
input.addEventListener("keydown", (event) => {
  event.preventDefault();
});
input.readOnly = true;
input.addEventListener("click", (e) => {
  if (e.target === input) {
    ipcRenderer.send("select-file");
  }
});
ipcRenderer.on("select-file-reply", (event, { fileName }) => {
  if (fileName) {
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    input.value = fileNameWithoutExt;
  } else {
    input.value = "";
  }
});

