  

Meteorup is a meteor enhancement tools.

Starting an application in production mode is as easy as:

```bash
$ meteorup deploy
```

## Install Meteorup

```bash
$ npm install meteorup -g
```

*npm is a builtin CLI when you install Node.js - [Installing Node.js with NVM](https://keymetrics.io/2015/02/03/installing-node-js-and-io-js-with-nvm/)*

## Deployment this project to meteorup.cn microhost ( like Galaxy )

```bash
$ meteorup deploy
```

## Configuration runtime environments on private server

```bash
$ meteorup setup
```

## Deployment a project to private server

```bash
$ meteorup push
```

## Setup and Deploy to your private server for config file
write to package.json file.
```js
{
    "server": {
        "host": "182.92.11.131",
        "username": "root",
        // "password": "password",
        // or pem file (ssh based authentication)
        // WARNING: Keys protected by a passphrase are not supported
        "pem": "~/.ssh/id_rsa",
        // Also, for non-standard ssh port use this
        "sshOptions": { "port" : 22 },
        // server specific environment variables
        "env": {}
    },
    "setup": {
		// Install MongoDB on the server. Does not destroy the local MongoDB on future setups
		"mongo": true,
		// Install Docker on the server.
		"docker": true,
		// Application server path .  must in /usr /opt /home /alidata directory.
		"path": "/usr/local/meteorup"
    },
    "deploy": {
		// Application name (no spaces).
		"appName": "best",
		// use server docker image name. 
		// defualt : meteorhacks/meteord:base
		// "dockerImage": "index.alauda.cn/romejiang/meteor"
		"dockerImage": "romejiang/meteor:v53",
		// Configure environment
		// ROOT_URL must be set to your correct domain (https or http)
	    "env": {
			"YJENV": "test",
            "MONGO_URL": "mongodb://127.0.0.1:27017/best",
			"PORT": 8181,
			"ROOT_URL": "http://182.92.11.131:8181"
		}
    } 
}
```


## Update Meteorup

```bash
# reinstall latest meteorup version
$ npm install meteorup -g
```


## License

Meteorup is made available under the terms of the MIT License (MIT)

