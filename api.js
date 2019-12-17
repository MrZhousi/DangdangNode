const express = require("express");
const app = new express();

var multiparty = require('multiparty');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require("mongodb").ObjectID;
const url = 'mongodb://localhost:27017';

app.use("/static/images",express.static("static/images"))

//图书列表
app.get("/bookList",function(req,res){
	MongoClient.connect(url,function(err,client){
		let collection=client.db("userInfo").collection("userInfo");
		collection.find({}).toArray(function(err,result){
			//替换反斜杠
			result.forEach(item=>{
				item.pic="http://localhost:3000/"+item.pic.replace(/\\/g,"/");

			})
			res.writeHead(200,{"Content-Type":"application/json"})
			res.write(JSON.stringify(result));
			res.end()
		})
	})
})

//图书详情接口
app.get("/bookDetail",function(req,res){
	// 1.接收id
	let id=ObjectID(req.query.id);
	// 2.根据id查询数据库，获取商品详情
	MongoClient.connect(url,function(err,client){
		let collection=client.db("userInfo").collection("userInfo");
		collection.findOne({_id:id},function(err,result){
			result.pic="http://localhost:3000/"+result.pic.replace(/\\/g,"/");
			// 3.返回json
			res.writeHead(200,{"Content-Type":"application/json"})
			res.write(JSON.stringify(result));
			res.end()
		})
	})
	
})

//图书分类列表
app.get("/typeList",function(req,res){
	MongoClient.connect(url,function(err,client){
		let collection=client.db("userInfo").collection("type");
		collection.find({}).toArray(function(err,result){
			//替换反斜杠
			result.forEach(item=>{
				item.pic="http://localhost:3000/"+item.pic.replace(/\\/g,"/");

			})
			res.writeHead(200,{"Content-Type":"application/json"})
			res.write(JSON.stringify(result));
			res.end()
		})
	})
})


app.listen(3000,()=>{
    console.log("-----api-----")
})