#!/usr/bin/env node

var jsonFile = '/home/www/lua/config.json';
var seek = require(jsonFile);
var fs = require('fs');
var path = require('path');

var result = null;
var max = 0;
var key = process.argv.splice(2);
if (key.length > 0){
  for(var p in seek){
      if(key[0] == p){
        result = seek[p];
      }
      if (max < parseInt(seek[p])) {
      	max = parseInt(seek[p]);
      }
//    console.log(p);
//    console.log(seek[p]);
  }
  if (result == null) {
  	seek[key[0]] = (max + 1) + "";
  	fs.writeFile(
  		jsonFile, 
  		JSON.stringify(seek),
  		function (err) {
  			if(!err)
  				console.log(max + 1);
  		}
    );
  }else{
  	console.log(result);
  }
}
