const { app, BrowserWindow } = require('electron')

const { ipcMain } = require('electron')
const Core = require('@alicloud/videoenhan-2020-03-20');
function superResolveVideo(accessKeyId, accessKeySecret, VideoUrl, rate) {
    return new Promise((res, rej)=> {
        var client = new Core({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
            securityToken: '', 
            endpoint: 'https://videoenhan.cn-shanghai.aliyuncs.com',
          });
          
          var params = {
            "VideoUrl": VideoUrl,
            "BitRate": rate
          }
    
        client.superResolveVideo(params).then(function (data) {
            res(data)
        }, function (err) {
            rej(err)
        });
    })
}
function getAsyncJobResult (accessKeyId, accessKeySecret, jobId) {
    return new Promise((res, rej)=> {
        var client = new Core({
            accessKeyId: accessKeyId,
            accessKeySecret: accessKeySecret,
            securityToken: '', 
            endpoint: 'https://videoenhan.cn-shanghai.aliyuncs.com',
        });
          
        var params = {
            "JobId": jobId,
        }
    
        client.getAsyncJobResult(params).then(function (data) {
            res(data)
        }, function (err) {
            rej(err)
        });
    })
}
function createWindow () {   
  // 创建浏览器窗口
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  ipcMain.on("superResolveVideo", (event, arg) => {
    let form = JSON.parse(arg);
    superResolveVideo(form.accessKeyId, form.accessKeySecret, form.url, form.rate).then((data)=>{
        event.reply("superResolveVideoReply", JSON.stringify(data))
    }).catch(err => {
        event.reply("superResolveVideoError", JSON.stringify(err))
    })
  })
  ipcMain.on("getAsyncJobResult", (event, arg) => {
    let form = JSON.parse(arg);
    getAsyncJobResult(form.accessKeyId, form.accessKeySecret, form.id).then((data)=>{
        event.reply("getAsyncJobResultReply", JSON.stringify(data))
    }).catch(err => {
        event.reply("getAsyncJobResultError", JSON.stringify(err))
    })
  })
  // 加载index.html文件
  // win.webContents.openDevTools()
  win.loadFile('front/index.html')
}

app.whenReady().then(createWindow)
