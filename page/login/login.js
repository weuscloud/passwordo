// renderer.js
const { ipcRenderer } = require("electron");
const Notification = require("../com/notification");
const { throttle } = require("../../com/throttle");
const log = require("../../com/log");
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
ipcRenderer.on("login-error", (event, arg) => {
  const { success, message } = arg;
  Notification.getInstance().show(message, "error");
});
