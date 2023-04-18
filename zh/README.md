# passwordo
### 一个密码保管程序，使用electron构建，加密方式为AES256GCM，由password生成key。

# 构建
从Github下载下列文件:
```
winCodeSign-2.6.0.7z
electron-v24.1.2-win32-x64.zip
```
3.将上述两个文件放在目录 %USERPROFILE%\AppData\Local\electron\Cache 下。
### 4.执行
```bash
electron-builder -w
```
## 登录页
![image](https://user-images.githubusercontent.com/103351906/232045402-3381a78c-21b1-4a64-8b45-d7697232c7ff.png)

## 主页
![image](https://user-images.githubusercontent.com/103351906/232045567-0acc4251-af44-4945-a395-79215ba038b5.png)

## 新建账户

![image](https://user-images.githubusercontent.com/103351906/232791435-572e458f-b53f-44ed-af8e-f0ac08b593f0.png)

## 管理页
![image](https://user-images.githubusercontent.com/103351906/232791156-5ede061a-5ac9-4f74-aee0-a55f241dec60.png)

## 完成

### 账户切换 
### 导入&新建账号
### 修改/复制账号名&密码

## todo 
### 语言切换
### 保存至数据库&远程
### 随机新建账号
### 改进事件侦听
### 备份&恢复
### 记录&显示上次存档时间
