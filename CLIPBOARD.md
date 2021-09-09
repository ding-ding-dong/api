# ---
production docker run cmd:
docker build -t ding-ding-dong-api .
docker run -d --init --name ding-ding-dong-api --restart=always -e NODE_ENV=production -e PORT=8080 -p 8080:8080 -v /var/redis/6379:/var/redis/6379 ding-ding-dong-api
docker stop ding-ding-dong-api && docker rm ding-ding-dong-api
docker exec -it ding-ding-dong-api bash
ps -ef

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

ECS需要配置安全组打开443端口

# ---

意外reboot vm会导致redis pid被杀掉，但pid文件还在：
cat /var/run/redis_6379.pid
ps aux | grep redis # 此时看不到redis的进程
需要手动删掉pid文件，重启server：
rm -rf /var/run/redis_6379.pid
cd /etc/init.d/ && ./redis_6379 start
此时对比上面二者的值，应该是一致的
docker stop的时候就会造成这个问题
当我们使用start.sh的时候，start.sh的pid为1，具体运行的命令的pid会是他的子进程：
root         1  0.2  0.1  11688  1352 ?        Ss   03:17   0:00 /bin/bash ./scripts/start.sh
root         9  0.1  0.3  41952  3376 ?        Ssl  03:17   0:00 /usr/local/bin/redis-server 127.0.0.1:6379
root        16 14.7  8.4 1169952 85940 ?       Sl   03:17   0:01 /usr/bin/node --experimental-modules --loader /app/bin/custom-loader.mjs /app/bin/www
此时docker stop只会给pid 1发送kill -15信号(SIGTERM)， pid 9和pid16都会kill - 9，所以会出现pid文件还在的现象
思路1：手动删除pid文件，然后docker restart
思路2：start.sh里面先无脑删掉pid文件再启动
思路3：dumb init，即docker run --init

SIGTERM:
The SIGTERM signal is a generic signal used to cause program termination. Unlike SIGKILL , this signal can be blocked, handled, and ignored. It is the normal way to politely ask a program to terminate. The shell command kill generates SIGTERM by default.
SIGTERM vs ctrl + c
This is not releated to bash, but to the underlying tty driver.
Usually, <ctrl>-C is SIGINT but you can change that to any other character with the stty command.
SIGTERM is not linked to an interrupt character but is just the signal sent by default by the kill command.

使用--init之后仍然有问题，尝试后发现：
cd /etc/init.d/ && ./redis_6379 start # 有问题
/usr/local/bin/redis-server
使用第一行的代码运行的redis-server会接受不到tini的sigterm信号
看现象就像是只有直接运行的二级制文件才能收到信号，猜测可能是tini的机制或bug

通过现象可以确定的：
redis-server起的pid 999，kill -9 999不会删除/var/run/redis_6379.pid，直接kill 999则会删除redis_6379.pid

# ---
tini or dumb-init
docker run --init 现在会自动使用tini作为init process
docker stop 有时候会等10秒，就是因为没有使用init process，pid 1在等10秒子进程自动退出

# ---
解决阿里云访问github慢的问题：
ECS在国内时，dns解析github.com等域名时指向的A记录（20.205.243.166，一般都是一个ELB，类似Jam F5或者Jam ccloud load balancer）被国内防火墙限制了，导致速度很慢
可以通过 https://github.com.ipaddress.com/ 直接查询到美国服务器的A记录ip地址：140.82.113.3
github.global.ssl.Fastly.net 199.232.69.194
vim /etc/hosts
140.82.113.3 github.com
199.232.69.194 github.global.ssl.fastly.net
改过之后，用nslookup或者dig查看域名的dns还是指向老的ip，但ping和curl已经是新的ip了（怀疑是dns cache的问题）
