# ---
production docker run cmd:
docker build -t ding-ding-dong-api .
docker run -d --name ding-ding-dong-api --restart=always -e NODE_ENV=production -e PORT=8080 -p 8080:8080 -v /var/redis/6379:/var/redis/6379 ding-ding-dong-api

localhost docker run cmd:
docker run -it --rm --name ding-ding-dong-api -e PORT=8080 -p 8080:8080 -v $HOME/redis:/var/redis/6379 ding-ding-dong-api

# ---

https://hub.docker.com/r/centos/systemd

FROM centos/systemd

RUN curl -sL https://rpm.nodesource.com/setup_8.x | bash - && yum install nodejs -y
RUN yum install gcc gcc-c++ make -y

RUN npm install --global yarn

RUN yum install epel-release -y
RUN yum install redis -y && yum clean all && systemctl enable redis.service

WORKDIR /app

COPY . .
COPY systemd.conf /etc/systemd/system/ding-ding-dong.service
RUN systemctl enable ding-ding-dong.service

RUN yarn

CMD ["./scripts/start.sh"]

# ---

[Unit]
Description=Ding Ding Dong API Server

[Service]
Type=simple
ExecStart=/usr/bin/node --experimental-modules --loader ./bin/custom-loader.mjs /app/bin/www
WorkingDirectory=/app
Environment=NODE_ENV=production PORT=8080
LimitNOFILE=infinity
LimitCORE=infinity
StandardInput=null
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ding-ding-dong-api
Restart=always

[Install]
WantedBy=multi-user.target


# ---

```dockerfile
RUN yum groupinstall 'Development Tools' -y
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo && rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg && yum install yarn -y
```

Before we can install Redis, we must first add Extra Packages for Enterprise Linux (EPEL) repository to the server’s package lists. EPEL is a package repository containing a number of open-source add-on software packages, most of which are maintained by the Fedora Project.

yum install epel-release

Total download size: 15 k
Installed size: 24 k
Is this ok [y/d/N]: y

docker run -it --rm --privileged --name ding-ding-dong-api -v /sys/fs/cgroup:/sys/fs/cgroup:ro ding-ding-dong-api bash

# ---

正确配置redis的启动：
Installing Redis more properly:
https://redis.io/topics/quickstart
https://wsk1103.github.io/2019/01/12/centos-7-%E5%AE%89%E8%A3%85Redis/

# ---
dockerignore的作用：COPY指令不会复制对应的内容

# ---
ECS上的操作：
centos7.9
ssh root@139.224.81.61

install docker:
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
systemctl enable docker
systemctl start docker

yum install git -y

Docker：docker国内镜像加速
https://www.cnblogs.com/nhdlb/p/12567154.html
vim /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://registry.docker-cn.com",
    "http://hub-mirror.c.163.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
systemctl daemon-reload && systemctl restart docker
check: docker info

build ding-ding-dong-web时要先装node和yarn
curl -sL https://rpm.nodesource.com/setup_8.x | bash - && yum install nodejs -y
npm install --global yarn
cd ding-ding-dong-web
yarn

# ---