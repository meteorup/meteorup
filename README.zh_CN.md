<p align="center">
  <a href="http://meteorup.cn/">
    <img alt="Meteorup" src="https://github.com/meteorup/meteorup/blob/master/logo.svg?raw=true" width="546">
  </a>
</p>

<p align="center">
  便捷、快速、安全地部署和托管 Meteor 应用
</p>

<p align="center">
  <a href="https://github.com/meteorup/meteorup/blob/master/README.md">English version</a>
</p>

---

**便捷：**我们公司的项目都是用 Meteor 编写的，各个项目的团队每天都会进行多次部署，Meteorup 已然成为这一过程中不可分割的部分，工程师们依赖它，是因为它足够便捷，在不知不觉中帮助他们节省了大量的时间。

**高速：**阿里云在国内拥有多个节点，Meteorup 在其之上搭建服务器群，使得 Meteor 应用得以秒开，完全满足中国客户的需求。

**安全：**每个 Meteor 应用及其对应的 MongoDB 数据库均运行于独立的 Docker 容器内，各自不会产生干扰。拥有了 Meteorup，如同雇佣了一只专业的运维团队，我们终于不再为运维伤脑筋了。

你或你的团队是否希望解放时间和精力，将其投入到真正重要的核心业务中去？反正我们团队是离不开 Meteorup 了，我相信它也会带给你们同样的价值。欢迎试用一下。

## 快速体验

第一步，安装 Meteorup:

```bash
$ npm install meteorup -g
```

第二步，获取 `KEY` 值：到 [meteorup.cn](http://meteorup.cn/) 完成注册并创建一个新项目。

第三步，使用刚刚获取的 `KEY` 值进行部署：

```bash
$ meteorup deploy your-app-name KEY
```

部署完成！访问 `your-app-name.meteorup.cn` 即可看到你的作品。

遇到问题了？[提交 issue](https://github.com/meteorup/meteorup/issues)，我们的团队会在第一时间回复你。
