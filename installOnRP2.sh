raspi-config
sudo raspi-config
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install oracle-java8-jdk
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential
sudo apt-get install -y nodejs-legacy
sudo npm install -g npm
sudo apt-get install -y git
GYP_DEFINES="armv7=0 javalibdir=/usr/lib/jvm/jdk-8-oracle-arm-vfp-hflt/jre/lib/arm/server" CCFLAGS='-march=armv6' CXXFLAGS='-march=armv6'  npm install -g java
sudo npm install -g pm2
pm2 install pm2-logrotate
pm2 install pm2-webshell
pm2 install pm2-auto-pull
git clone https://github.com/jhergeth/UPNPC.git
cd UPNPC/
npm install
pm2 start bin/www --max-memory-restart 300M
pm2 monit
exit
