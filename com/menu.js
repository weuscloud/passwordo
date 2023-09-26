const { Menu, app } = require('electron');
const { SingleWindow, getWindow } = require("./WindowMgr");
const { getGenshinPathByDialog } = require('./page.main');
const { exec } = require('child_process');
const { iniFileName, encryptedFileName, getBackupFileName } = require('./file');
const log = require('./log');
const path = require('path');
const template = [
  {
    label: 'Language',
    submenu: [
      {
        label: 'English',
        type: 'radio',
        checked: false,
        click: function () {
          // handle English click
          global._lang = 'en-US'
          SingleWindow(global.windowName);
        }
      },
      {
        label: '简体中文',
        type: 'radio',
        checked: false,
        click: function () {
          // handle Chinese click
          global._lang = 'zh-CN'
          SingleWindow(global.windowName);
        }
      },
      {
        label: 'Default',
        type: 'radio',
        checked: true,
        enabled: false, // 将该选项禁用
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Forward game path',
        type: 'normal',
        click: function () {
          getGenshinPathByDialog()
        }
      },
      {
        label: 'Configure preference',
        type: 'normal',
        click: function () {
          // 使用记事本打开文件
          exec(`notepad.exe "${iniFileName}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error opening file: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Error output: ${stderr}`);
              return;
            }
          });
        }
      },
      {
        label: 'Backup accounts',
        type: 'normal',
        click: function () {
          // 要复制的源文件和目标文件的路径
          const sourceFile = encryptedFileName;
          const targetFile = getBackupFileName();

          // 根据操作系统选择适当的复制命令
          const copyCommand = process.platform === 'win32' ? `copy ${sourceFile} ${targetFile}` : `cp ${sourceFile} ${targetFile}`;

          // 执行复制命令
          exec(copyCommand, (error, stdout, stderr) => {
            if (error) {
              log('ERROR', __filename, `复制文件时出错: ${error}`);
              return;
            }
            log('INFO', __filename, `文件已成功复制: ${sourceFile} -> ${targetFile}`);
          });
        }
      },
      {
        label: 'Open workdir',
        type: 'normal',
        click: function () {
          exec(`explorer.exe "${path.dirname(iniFileName)}"`, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error opening file: ${error.message}`);
              return;
            }
            if (stderr) {
              console.error(`Error output: ${stderr}`);
              return;
            }
          });
        }
      }
    ]
  },
  {
    label: 'Debug',
    click: function () {
      // handle about click
      getWindow(global.windowName).webContents.toggleDevTools();
    }
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('activate', function () {
  Menu.setApplicationMenu(menu);
});
module.exports = {
  menu
}