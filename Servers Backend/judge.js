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

let code = [];
let text = [];
let pro = [];
let usr = [];
let NewCodeList = [];
let num = 0;

fs.readFile('./data/user.json', 'utf8', (err, UsrList) => {
    if (err) {
        console.error('读取文件失败:', err);
    }
    else {
        try {
            usr = JSON.parse(UsrList);
        }
        catch (error) {
            console.error('解析 JSON 失败:', error);
        }
    }
});

app.post("/api/problem/send", (req, res) => {
    const pid = req.body.pid;
    const user = req.body.user;
    const content = req.body.content;
    fs.readFile('./data/problem.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                pro = JSON.parse(data);
                for (let i = 0; i < pro.length; i++) {
                    if (pro[i].pid == pid) {
                        ++pro[i].all;
                    }
                }
            }
            catch (error) {
                console.error('解析 problem.json 失败:', error);
            }
        }
    });
    fs.readFile('./data/code/code.json', 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件失败:', err);
        }
        else {
            try {
                NewCodeList = JSON.parse(data);
                num = NewCodeList.length + 1;
                const responseData = {
                    num: num,
                    res: "succeed"
                };
                res.json(responseData);
                let other = {
                    timestamp: Date.now()
                };
                let NewCode = {
                    id: num,
                    pid: pid,
                    user: user,
                    content: content,
                    sta: "Waiting",
                    timestamp: Date.now()
                };
                NewCodeList.push(NewCode);
                fs.writeFile(`./data/code/code.json`, JSON.stringify(NewCodeList, null, 2), async err => {
                    if (err) {
                        console.error('写入文件失败:', err);
                    }
                });
                // console.log(`【代码提交】${user} 【提交题目】${pid} 【提交编号】${num} 【时间】${Date.now()}`);
                fs.writeFile(`./data/code/other.json`, JSON.stringify(other, null, 2), async err => {
                    if (err) {
                        console.error('code.json 写入 Waiting 状态文件失败:', err);
                    }
                    else {
                        let problem = {
                            input: null,
                            expectedOutput: null,
                        };
                        fs.readFile('./data/example.json', 'utf8', (err, Text) => {
                            if (err) {
                                console.error('读取文件失败:', err);
                            }
                            else {
                                try {
                                    text = JSON.parse(Text);
                                    for (let i = 0; i < text.length; i++) {
                                        const item = text[i];
                                        if (item.pid == pid) {
                                            problem = {
                                                input: item.input,
                                                expectedOutput: item.output,
                                            };
                                        }
                                    }
                                }
                                catch (error) {
                                    console.error('解析 JSON 失败:', error);
                                }
                            }
                        });
                        try {
                            await fs.promises.writeFile(`./data/code/cpp/${num}.cpp`, content);       // write user's cpp in ${num}.cpp
                            try {
                                execSync(`g++ ./data/code/cpp/${num}.cpp -o ./data/code/cpp/${num}`, { stdio: 'ignore' });     // Compile and generate
                                try {
                                    var result = execSync(`./data/code/cpp/${num}`, { input: problem.input, encoding: 'utf-8' });     // 运行
                                    if (result.replace(/rn/g, "").replace("n", "").trim() == problem.expectedOutput.replace(/rn/g, "").replace("n", "").trim()) {             // AC
                                        console.log(`【代码提交】${user} 【提交题目】${pid} 【提交编号】${num} 【时间】${Date.now()} 【状态】AC`);
                                        let temp = {
                                            id: num,
                                            pid: pid,
                                            user: user,
                                            content: content,
                                            sta: "AC",
                                            timestamp: Date.now()
                                        };
                                        code.push(temp);
                                        for (var j = 0; j < usr.length; j++) {
                                            if (usr[j].name == user) {
                                                ++usr[j].pro;
                                            }
                                        }
                                        for (let i = 0; i < pro.length; i++) {
                                            if (pro[i].pid == pid) {
                                                ++pro[i].ac;
                                            }
                                        }
                                        fs.writeFile(`./data/problem.json`, JSON.stringify(pro, null, 2), async err => {
                                            if (err) {
                                                console.error('写入文件失败:', err);
                                            }
                                        });
                                        fs.writeFile(`./data/code/code.json`, JSON.stringify(code, null, 2), async err => {
                                            if (err) {
                                                console.error('写入文件失败:', err);
                                            }
                                        });
                                        fs.writeFile(`./data/user.json`, JSON.stringify(usr, null, 2), async err => {
                                            if (err) {
                                                console.error('写入文件失败:', err);
                                            }
                                        });
                                    }
                                    else {            // WA
                                        console.log(`【代码提交】${user} 【提交题目】${pid} 【提交编号】${num} 【时间】${Date.now()} 【状态】WA`);
                                        let temp = {
                                            id: num,
                                            pid: pid,
                                            user: user,
                                            content: content,
                                            sta: "WA",
                                            timestamp: Date.now()
                                        };
                                        code.push(temp);
                                        fs.writeFile(`./data/problem.json`, JSON.stringify(pro, null, 2), async err => {
                                            if (err) {
                                                console.error('写入文件失败:', err);
                                            }
                                        });
                                        fs.writeFile(`./data/code/code.json`, JSON.stringify(code, null, 2), async err => {
                                            if (err) {
                                                console.error('写入文件失败:', err);
                                            }
                                        });
                                    }
                                }
                                catch (error) {
                                    console.log(`程序运行失败 【编号】${num}`);
                                    let temp = {
                                        id: num,
                                        pid: pid,
                                        user: user,
                                        content: content,
                                        sta: "UnknowError",
                                        timestamp: Date.now()
                                    };
                                    code.push(temp);
                                    fs.writeFile(`./data/problem.json`, JSON.stringify(pro, null, 2), async err => {
                                        if (err) {
                                            console.error('写入文件失败:', err);
                                        }
                                    });
                                    fs.writeFile(`./data/code/code.json`, JSON.stringify(code, null, 2), async err => {
                                        if (err) {
                                            console.error('写入文件失败:', err);
                                        }
                                    });
                                }
                            }
                            catch (error) {             // CE
                                console.log(`【代码提交】${user} 【提交题目】${pid} 【提交编号】${num} 【时间】${Date.now()} 【状态】CE`);
                                let temp = {
                                    id: num,
                                    pid: pid,
                                    user: user,
                                    content: content,
                                    sta: "CE",
                                    timestamp: Date.now()
                                };
                                code.push(temp);
                                fs.writeFile(`./data/problem.json`, JSON.stringify(pro, null, 2), async err => {
                                    if (err) {
                                        console.error('写入文件失败:', err);
                                    }
                                });
                                fs.writeFile(`./data/code/code.json`, JSON.stringify(code, null, 2), async err => {
                                    if (err) {
                                        console.error('写入文件失败:', err);
                                    }
                                });
                            }
                        }
                        catch (error) {
                            console.error('文件写入失败:', error);
                        }
                    }
                });
            }
            catch (error) {
                console.error('解析 code.json 失败:', error);
            }
        }
    });
});

const port = 9901;
app.listen(port, () => {
    console.log(`Server listening on http://10.31.3.47:${port}`);
});