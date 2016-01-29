# Zrickr Backend

Zrickr Backend using Express and MongoDB to organizate films, series, books, etc.

## Previous Requirements on Windows

### Cmder and Atom

Download and install Cmder for console commands (http://cmder.net/)

Download and install Atom for edit files (https://atom.io/)

###Nodejs,nvm and npm

Download and install nodejs and npm (https://nodejs.org/en/download/)

Download and install nvm (https://github.com/coreybutler/nvm-windows/releases)

### MongoDB

Download MongoDB (https://www.mongodb.org/downloads#production)

Create and edit file "C:\Program Files\MongoDB\Server\3.2\bin\mongod.conf" with the next lines:

`dbpath=D:\data\db`

`logpath=D:\data\log\mongod.log`

`logappend=true`

`bind_ip = 127.0.0.1`

`port = 27017`

`journal=true`

`nohttpinterface=true`

`rest=false`

Create directory "D:\data\log"

Add "C:\Program Files\MongoDB\Server\3.2\bin" to the "Path" Windows environment variable

Excute on console: `mongod --config "C:\Program Files\MongoDB\Server\3.2\bin\mongod.conf" --install`

## Proyect Installation

git clone https://github.com/jlramosr/zrickr_be.git zrickr_be

cd zrickr_be && npm install

npm start
