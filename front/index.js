const {ipcRenderer} = require("electron")

function onSubmit() {
    localStorage.setItem("accessKeyId", this.form.accessKeyId)
    localStorage.setItem("accessKeySecret", this.form.accessKeySecret)
    ipcRenderer.send("superResolveVideo", JSON.stringify(this.form))
}

function onSuccess(event, arg) {
    var res = JSON.parse(arg);
    console.log(res)
    app.requestids.push(res.RequestId);
    app.id = res.RequestId;
    app.task.id = res.RequestId;
    localStorage.setItem("superResolveVideoCurrentRequest", res.RequestId)
    localStorage.setItem("superResolveVideoRequests", JSON.stringify(app.requestids))
    app.form.url = ""
    app.form.disabled = true
    app.task.url = ""
}


function onError(event, arg) {
    var res = JSON.parse(arg);
    app.id = ""
    localStorage.setItem("superResolveVideoCurrentRequest", "")
    app.form.disabled = false
    app.error = res.Data.JobId + ": " +res.Data.ErrorMessage
}

function interval() {
    if(app.id && app.form.accessKeyId && app.form.accessKeySecret) {
        ipcRenderer.send("getAsyncJobResult", JSON.stringify({
            accessKeyId: app.form.accessKeyId,
            accessKeySecret: app.form.accessKeySecret,
            id: app.id,
        }))
    }
}

function onJobReply(event, arg) {
    var res = JSON.parse(arg);
    if(!res.Data) {
        return
    }
    if(res.Data.Status == "PROCESS_FAILED") {
        app.id = ""
        app.error = res.Data.JobId + ": " +res.Data.ErrorMessage
        localStorage.setItem("superResolveVideoCurrentRequest", "")
        app.form.disabled = false
    } else {
        app.error = false
        app.task.id = res.Data.JobId
        app.task.status =  res.Data.Status
        var result = res.Data.Result
        if(result) {
            var r = JSON.parse(result)
            app.task.url = r.VideoUrl
        }
        if(res.Data.Status == "PROCESS_SUCCESS") {
            app.id=""
            app.form.disabled = false
        }
        console.log(res)
    }
}

function mounted() {
    this.form.accessKeyId = localStorage.getItem("accessKeyId")
    this.form.accessKeySecret = localStorage.getItem("accessKeySecret")
    var ids = localStorage.getItem("superResolveVideoRequests")
    this.id = localStorage.getItem("superResolveVideoCurrentRequest")
    if (ids) {
        this.requestids = JSON.parse(ids);
    }
    if(this.id) {
        this.form.disabled = true
    }
    ipcRenderer.on("superResolveVideoReply", onSuccess)
    ipcRenderer.on("superResolveVideoError", onError)
    ipcRenderer.on("getAsyncJobResultReply", onJobReply)
    // ipcRenderer.on("getAsyncJobResultError", onError)
    setInterval(interval, 5000)
}

function data() {
    return {
        form: {
            accessKeyId: "",
            accessKeySecret: "",
            url: "",
            disabled: false,
            rate: 2
        },
        task: {
            id: "",
            status: "",
            url:"",
        },
        id: "",
        error: false,
        requestids: [],
    }
}
var app = new Vue({
    el: '#app',
    data,
    mounted,
    created() {
        document.querySelector('#app_mask').style = 'display:none';
        document.querySelector('#app').style = 'visibility: visible;';
    },
    methods: {
      onSubmit
    }
})