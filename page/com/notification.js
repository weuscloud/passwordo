class Notification {
  constructor() {}

  static getInstance() {
    if (!Notification.instance) {
      Notification.instance = new Notification();
    }
    return Notification.instance;
  }

  createContainer() {
    this.container = document.createElement("div");
    this.container.style.position = "fixed";
    this.container.style.top = "-60px";
    this.container.style.zIndex = "100";
    this.container.style.left = "50%";
    this.container.style.transform = "translateX(-50%)";
    this.container.style.minWidth = "300px";
    this.container.style.color = "#f5f5f5";
    this.container.style.height = "55px";
    this.container.style.backgroundColor = "#f5f5f5";
    this.container.style.borderRadius = "4px";
    this.container.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
    this.container.style.display = "flex";
    this.container.style.justifyContent = "center";
    this.container.style.alignItems = "center";
    this.container.style.transition = "top 0.5s ease-in-out";
    document.body.appendChild(this.container);
  }

  show(message, type) {
    if (!this.container) {
      this.createContainer();
    }
    this.container.innerText = message;

    switch (type) {
      case "warning":
        this.container.style.backgroundColor = "#ffa500";
        break;
      case "error":
        this.container.style.backgroundColor = "#ff0000";
        break;
      case "success":
        this.container.style.backgroundColor = "#ff0000";
        break;
      default:
        this.container.style.backgroundColor = "#1677ff";
        break;
    }
    this.container.style.top = "5px";
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.container.style.top = "-60px";
    }, 1000);
  }
}

module.exports = Notification;
