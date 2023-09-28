const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const { execSync } = require('child_process');

const app = express();

app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

let list = [];
let code = [];
let des = [];
let text = [];
let message = [];
let pro = [];
let usr = [];

fs.readFile('./data/code/code.json', 'utf8', (err, data) => {
    if (err) {
        console.error('读取文件失败:', err);
    }
    else {
        try {
            code = JSON.parse(data);
            num = code.length;
        }
        catch (error) {
            console.error('解析 JSON 失败:', error);
        }
    }
});

app.get("/api/userlist", (req, res) => {
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    item.str = '';
                    item.email = '';
                    item.mod = '';
                    item.pass = '';
                    item.timestamp = '';
                }
                res.json(list);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.get("/api/problemlist", (req, res) => {
    fs.readFile('./data/problem.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                res.json(list);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.get("/api/evallist", (req, res) => {
    fs.readFile('./data/code/code.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                code = JSON.parse(data);
                res.json(code);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/mess", (req, res) => {
    const issuer = req.body.issuer;
    const receier = req.body.receier;
    const mess = req.body.mess;
    fs.readFile('./data/message/message.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                message = JSON.parse(data);
                let NewMessage = {
                    issuer: issuer,
                    receier: receier,
                    message: mess,
                    timestamp: Date.now()
                };
                message.push(NewMessage);
                fs.writeFile(`./data/message/message.json`, JSON.stringify(message, null, 2), async err => {
                    if (err) {
                        console.error('写入 message/message.json 失败:', err);
                    }
                    else {
                        res.json(message);
                    }
                });
            }
            catch (error) {
                console.error('解析 message/message.json 失败:', error);
            }
        }
    });
});

app.post("/api/getmess", (req, res) => {
    const issuer = req.body.issuer;
    const receier = req.body.receier;
    fs.readFile('./data/message/message.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                message = JSON.parse(data);
                let mlist = [];
                for (let i = 0; i < message.length; i++) {
                    const item = message[i];
                    if (item.issuer == issuer && item.receier == receier) {
                        mlist.push(item);
                    }
                    else if (item.issuer == receier && item.receier == issuer) {
                        mlist.push(item);
                    }
                }
                res.json(mlist);
            }
            catch (error) {
                console.error('解析 message/message.json 失败:', error);
            }
        }
    });
});

app.post("/api/evallist/pro", (req, res) => {
    const id = req.body.id;
    fs.readFile('./data/code/code.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                let responseData = {
                    id: null,
                    pid: null,
                    user: null,
                    sta: null,
                    content: null
                };
                code = JSON.parse(data);
                for (let i = 0; i < code.length; i++) {
                    const item = code[i];
                    if (item.id == id) {
                        responseData = {
                            id: item.id,
                            pid: item.pid,
                            user: item.user,
                            sta: item.sta,
                            content: item.content
                        };
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/problem/name", (req, res) => {
    const pid = req.body.pid;
    fs.readFile('./data/problem.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                let responseData = {
                    name: ""
                };
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.pid == pid) {
                        responseData = {
                            name: `${item.name}`
                        };
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/problem/create/pid", (req, res) => {
    fs.readFile('./data/problem.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                pro = JSON.parse(data);
                let responseData = {};
                let pid = null;
                for (let i = 0; i < pro.length; i++) {
                    const item = pro[i];
                    pid = item.pid;
                }
                responseData = {
                    pid: pid
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/problem/create/save", (req, res) => {
    let infor = req.body.ProblemInfor;
    var Pid = null;
    fs.readFile('./data/problem.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                pro = JSON.parse(data);
                for (let i = 0; i < pro.length; i++) {
                    const item = pro[i];
                    Pid = item.pid;
                }


                let k = parseInt(Pid.slice(-4), 10);
                ++k;
                let result = k.toString().padStart(4, '0');
                let final = Pid.slice(0, -4) + result;
                Pid = final;

                let infor1 = {
                    name: infor.name,
                    pid: Pid,
                    id: pro.length + 1,
                    all: 0,
                    ac: 0
                };
                pro.push(infor1);
                fs.writeFile(`./data/problem.json`, JSON.stringify(pro, null, 2), async err => {
                    if (err) {
                        console.error('写入文件失败:', err);
                    }
                });
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
    fs.readFile('./data/des.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                des = JSON.parse(data);

                let infor2 = {
                    pid: Pid,
                    de: infor.des,
                    input: infor.input,
                    output: infor.output,
                    radius: infor.radius
                };
                des.push(infor2);
                fs.writeFile(`./data/des.json`, JSON.stringify(des, null, 2), async err => {
                    if (err) {
                        console.error('写入文件失败:', err);
                    }
                });
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
    fs.readFile('./data/ExamPro.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                let temp = JSON.parse(data);

                let infor3 = {
                    pid: Pid,
                    input: infor.inpro1,
                    output: infor.outpro1,
                };
                let infor4 = {
                    pid: Pid,
                    input: infor.inpro2,
                    output: infor.outpro2,
                };

                temp.push(infor3);
                temp.push(infor4);
                fs.writeFile(`./data/ExamPro.json`, JSON.stringify(temp, null, 2), async err => {
                    if (err) {
                        console.error('写入文件失败:', err);
                    }
                });
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
    fs.readFile('./data/example.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                let temp = JSON.parse(data);

                let infor5 = {
                    pid: Pid,
                    input: infor.inexam,
                    output: infor.outexam,
                };

                temp.push(infor5);
                fs.writeFile(`./data/example.json`, JSON.stringify(temp, null, 2), async err => {
                    if (err) {
                        console.error('写入文件失败:', err);
                    }
                    else {
                        let ResP = {
                            pid: Pid
                        };
                        res.json(ResP);
                    }
                });
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/problem/infor", (req, res) => {
    const pid = req.body.pid;
    fs.readFile('./data/des.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                let responseData = {};
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.pid == pid) {
                        responseData = item;
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.get("/api/rank", (req, res) => {
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                usr = JSON.parse(data);
                let responseData = [];
                for (let i = 0; i < usr.length; i++) {
                    const item = usr[i];
                    responseData.push({ name: item.name, ac: item.pro, uid: item.uid });
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/problem/example", (req, res) => {
    const pid = req.body.pid;
    fs.readFile('./data/ExamPro.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                let responseData = [];
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.pid == pid) {
                        responseData.push(item);
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/user", (req, res) => {
    const str = req.body.data;
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                let responseData = {
                    user: "no",
                    mod: "no"
                };
                list = JSON.parse(data);
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.str == str) {
                        responseData = {
                            user: item.name,
                            mod: item.mod
                        };
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/uid", (req, res) => {
    const user = req.body.data;
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                let responseData = {
                    id: 0
                };
                list = JSON.parse(data);
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.name == user) {
                        responseData = {
                            id: item.uid
                        }
                    }
                }
                res.json(responseData);
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/get", (req, res) => {
    const user = req.body.user.trim();
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.name == user) {
                        const responseData = {
                            str: item.str,
                            mod: item.mod
                        };
                        res.json(responseData);
                        return;
                    }
                }
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/login", (req, res) => {
    const user = req.body.user.trim();
    const pass = req.body.pass.trim();
    const str = req.body.str.trim();
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                var flag = 0;
                flag = 2;
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.name == user) {
                        if (item.pass == pass) {
                            flag = 1;
                            item.str = str;
                            fs.writeFile(`./data/user.json`, JSON.stringify(list, null, 2), async err => {
                                if (err) {
                                    console.error('写入文件失败:', err);
                                    return res.json({ success: false });
                                }
                                else {
                                    console.log(`【用户登录】${user}  【时间】${Date.now()}`);
                                }
                            });
                        }
                        else flag = -1;
                    }
                }
                if (flag == 2) {
                    const responseData = {
                        res: "no-user"
                    };
                    res.json(responseData);
                }

                else if (flag == 1) {
                    const responseData = {
                        res: "succeed"
                    };
                    res.json(responseData);
                }
                else {
                    const responseData = {
                        res: "wrong-pass"
                    };
                    res.json(responseData);
                }
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/reg", (req, res) => {
    const name = req.body.name.trim();
    const email = req.body.email.trim();
    const pass = req.body.pass.trim();
    const str = req.body.str.trim();
    var uid = 1;
    fs.readFile('./data/user.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                list = JSON.parse(data);
                uid = list.length + 1;
                var flag = 0;
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    if (item.name == name) {
                        flag = 1;
                    }
                }
                if (flag == 1) {
                    const responseData = {
                        res: "dup"
                    };
                    res.json(responseData);
                }
                else {
                    list.push({
                        str: str,
                        name: name,
                        email: email,
                        mod: "common",
                        pass: pass,
                        uid: uid,
                        pro: 0,
                        timestamp: Date.now()
                    });
                    const responseData = {
                        res: "succeed"
                    };
                    fs.writeFile(`./data/user.json`, JSON.stringify(list, null, 2), async err => {
                        if (err) {
                            console.error('写入文件失败:', err);
                            return res.json({ success: false });
                        }
                        else {
                            const transporter = nodemailer.createTransport({
                                service: '163',
                                auth: {
                                    user: 'zzh19914763560@163.com',
                                    pass: 'MDRAZJMVRRTDYBGZ'
                                }
                            });
                            const mailOptions = {
                                from: 'ZB OJ <zzh19914763560@163.com>',
                                to: email,
                                subject: '欢迎加入 ZB OJ 在线测评平台！',
                                text:
                                    `亲爱的 ${name}：

感谢您注册加入我们的在线评测系统！您的账户已成功创建!

您的用户名：${name}
注册邮箱：${email}
用户类型: 普通用户

为了确保您的账户安全，请注意以下事项：

- 设置一个强密码，定期更新密码。
- 不要与他人分享您的账户信息。
- 如遇到任何问题，请联系我们的支持团队：zzh19914763560@163.com
- 了解更多关于我们平台的功能和使用方法，请访问我们的网站：http://10.31.3.47:9090

祝您在我们的平台上度过愉快的时光！
`
                            };
                            try {
                                const info = await transporter.sendMail(mailOptions);
                                console.log(`【用户注册】${name}  【时间】${Date.now()}`);
                                res.json(responseData);
                            }
                            catch (error) {
                                console.error('邮件发送失败:', error);
                                res.status(500).json({ error: '邮件发送失败' });
                            }
                        }
                    });
                }
            }
            catch (error) {
                console.error('解析 JSON 失败:', error);
            }
        }
    });
});

app.post("/api/server", (req, res) => {
    const str = req.body.str.trim();
    let responseData = {
        str: str
    };
    res.json(responseData);
});

const port = 9900;
app.listen(port, () => {
    console.log(`Server listening on http://10.31.3.47:${port}`);
});