// renderer.js
const { ipcRenderer } = require("electron");
const loginForm = document.getElementById("login-form");
const Notification = require("../../com/notification");
const { throttle } = require("../../com/throttle");

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
  console.log(arg);
  Notification.getInstance().show(message, "error");
});
