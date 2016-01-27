apt-get update
apt-get upgrade -y
apt-get install -y apt-utils
apt-get install -y curl
curl -sL https://deb.nodesource.com/setup_4.x | bash -
apt-get install -y nodejs
apt-get install -y build-essential
apt-get install -y nodejs-legacy
npm install -g npm
apt-get install -y oracle-java8-jdk
GYP_DEFINES="armv7=0 javalibdir=/usr/lib/jvm/jdk-8-oracle-arm-vfp-hflt/jre/lib/arm/server" CCFLAGS='-march=armv6' CXXFLAGS='-march=armv6'  npm install -g java
apt-get install -y git
npm install -g pm2
pm2 install pm2-logrotate
pm2 install pm2-webshell
pm2 install pm2-auto-pull
git clone https://github.com/jhergeth/UPNPC.git
cd UPNPC/
npm install
pm2 start bin/www --max-memory-restart 300M
pm2 monit
exit
