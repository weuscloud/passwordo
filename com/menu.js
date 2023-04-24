const { Menu, app } = require('electron');

const template = [
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: function () {
          // handle about click
        }
      }
    ]
  },
  {
    label: 'Language',
    submenu: [
      {
        label: 'English',
        type: 'radio',
        checked: true,
        click: function () {
          // handle English click
        }
      },
      {
        label: '中文',
        type: 'radio',
        click: function () {
          // handle Chinese click
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('activate', function () {
  if (process.platform === 'darwin') {
    if (Menu.getApplicationMenu() === null) {
      Menu.setApplicationMenu(menu);
    }
  }
});
