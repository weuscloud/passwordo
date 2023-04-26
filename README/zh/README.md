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
![image](https://user-images.githubusercontent.com/103351906/234022344-d94dac6f-0fe9-4f42-85d6-1a7d194fd50f.png)

## 主页
![image](https://user-images.githubusercontent.com/103351906/234022413-c8c01d94-6849-4931-a024-444099af550f.png)

## 新建账户

![image](https://user-images.githubusercontent.com/103351906/234022584-454efabc-19ee-4472-9c0c-4128a66f42bf.png)

## 管理页
![image](https://user-images.githubusercontent.com/103351906/234022497-818cf35e-88dd-4e73-9339-ec35d34152d5.png)

## 完成

### 账户切换 
### 导入&新建账号
### 修改/复制账号名&密码
### 语言切换

## todo 

### 保存至数据库&远程
### 随机新建账号
### 改进事件侦听
### 备份&恢复
### 记录&显示上次存档时间
