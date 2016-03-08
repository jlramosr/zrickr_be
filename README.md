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

`auth=true`

Create directory "D:\data\log"

Add "C:\Program Files\MongoDB\Server\3.2\bin" to the "Path" Windows environment variable

Execute on console: `mongod --config "C:\Program Files\MongoDB\Server\3.2\bin\mongod.conf" --install`

### Node modules

`npm install -g nodemon node-inspector`

### Python

Download and install Python 2.7 (https://www.python.org/downloads/)

Add the python main directory to the "Path" Windows environment variable

### Visual Studio

Download and install Visual Studio with option "Programming Language = visual c++" checked (https://www.visualstudio.com/es-es/downloads/download-visual-studio-vs.aspx)

## Proyect Installation

`git clone https://github.com/jlramosr/zrickr_be.git zrickr_be`

`cd zrickr_be && npm install`

`npm start` (see all tasks on package.json)

## Usage

### Public Routes

**`POST signup { "local": {"email": "1", "password": "1234"} }`**: User signup

**`POST login {"username": "1", "password": "1234"}`**: User login

### Protected or User Routes

Is necessary to introduce Login Process Token returned in Header.Authorization = "Bearer TOKEN"

**`GET profile`**: Return user information

**`GET signout`**: User signout

**`GET api/users`**: Return all users

**`GET api/users/ID`**: Return user identified by ID parameter

**`GET api/collections`**: Return all user collections

**`GET api/collections/ID`**: Return user collection identified by ID parameter

**`GET api/zrickers`**: Return all user zrickers of all collections

**`GET api/zrickers/COL`**: Return all user zrickers of a collection identified by COL slug parameter

**`GET api/zrickers/COL/id`**: Return user zrickr identified by ID parameter of a collection identified by COL slug parameter

**`GET api/films`**: Return all user films

**`GET api/films/ID`**: Return user film identified by ID parameter

**`POST api/films {"title": "Titanic", "year": 1999}`**: Insert an user film

**`POST api/collections
{
    "name": "War Planes",
    "fields": [
        {
            "name": "brand",
            "type": "String",
            "required": true,
            "unique": true,
            ""
        },
        {
            "name": "color",
            "type": "String",
            "required": true
        },
        {
            "name": "price",
            "type": "Integer"
        }
    ]
}
`**: Insert an user customized collection

**`POST api/zrickers { "collection": "war-planes", "color": "red", "brand": "Opel", "sadsad": "noinsert" }`**: Insert a zrickr element into a collection

**`PUT profile/update { "local": {"password": "12345"} }`**: Update user information

**`PUT api/films {"genre": "Drama"}`**: Update all user films

**`PUT api/films/ID {"genre": "Drama"}`**: Update user film identified by ID parameter

**`DELETE api/collections`**: Delete all user collections

**`DELETE api/collections/ID`**: Delete user collection identified by ID parameter

**`DELETE api/zrickers`**: Delete all user zrickers

**`DELETE api/zrickers/COL`**: Delete all user zrickers of a collection identified by COL slug parameter

**`DELETE api/zrickers/COL/ID`**: Delete zrickr identified by ID parameter of a collection identified by COL slug parameter

**`DELETE api/films/ID`**: Delete user film identified by ID parameter
