# passwordo
### one password save and copy tool,using electron,which can save store accounts to file(AES256GCM encrypted,generate Key by SHA-256 of password).
### 一个密码保管程序，使用electron构建，加密方式为AES256GCM，由password生成key。

#build
download these files from github:
1.winCodeSign-2.6.0.7z
2.electron-v24.1.2-win32-x64.zip
3.excute
```bash
electron-builder -w
```
## page login
![image](https://user-images.githubusercontent.com/103351906/232045402-3381a78c-21b1-4a64-8b45-d7697232c7ff.png)

## page copy
![image](https://user-images.githubusercontent.com/103351906/232045567-0acc4251-af44-4945-a395-79215ba038b5.png)

## new account

![image](https://user-images.githubusercontent.com/103351906/232045747-e53e6844-9673-412b-9db4-45904d2c2c3e.png)

## page manage
![image](https://user-images.githubusercontent.com/103351906/232045979-88e5d19e-8aa7-45b5-a611-d9ac9dc3bce7.png)

## finished

### 账户切换 
### 导入&新建账号
### 修改账号名&密码
### 复制账号&密码

## todo 
### 多语言切换
### 保存至数据库&远程
### 随机新建账号功能
### 文件导入功能
### 修改管理密码功能
### 改进事件侦听
### 备份&恢复

## 记录&显示上次存档时间