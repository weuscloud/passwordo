

function createContainer(inst) {
  if (inst instanceof Notification) {
    inst.container = document.createElement("div");
    inst.container.style.position = "fixed";
    inst.container.style.top = "-60px";
    inst.container.style.zIndex = "100";
    inst.container.style.left = "50%";
    inst.container.style.transform = "translateX(-50%)";
    inst.container.style.minWidth = "300px";
    inst.container.style.color = "#f5f5f5";
    inst.container.style.height = "55px";
    inst.container.style.backgroundColor = "#f5f5f5";
    inst.container.style.borderRadius = "4px";
    inst.container.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
    inst.container.style.display = "flex";
    inst.container.style.justifyContent = "center";
    inst.container.style.alignItems = "center";
    inst.container.style.transition = "top 0.5s ease-in-out";
    document.body.appendChild(inst.container);
  }
}
class Notification {
  constructor() {}

  static getInstance() {
    if (!Notification.instance) {
      Notification.instance = new Notification();
    }
    return Notification.instance;
  }

  show(message, type) {
    if (!this.container) {
      createContainer(this);
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
        this.container.style.backgroundColor = "#52c41a";
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
  shoWithUid(uid, type, ...args) {
    if (!this.container) {
      createContainer(this);
    }
    const message = args.join(" ");
    this.container.innerText = "";
    this.container.innerText += message;
    this.container.innerText += `\nuID:${uid}\n`;

    switch (type) {
      case "warning":
        this.container.style.backgroundColor = "#ffa500";
        break;
      case "error":
        this.container.style.backgroundColor = "#ff0000";
        break;
      case "success":
        this.container.style.backgroundColor = "#52c41a";
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
