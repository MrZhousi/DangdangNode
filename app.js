const express = require("express")
const app = express()
const MongoClient = require("mongodb").MongoClient
const multiparty = require("multiparty")
const url = 'mongodb://localhost:27017'
// 引入express-session
const session = require("express-session");
app.use(session({
    secret: 'keyboard cat',  //加密方式
    cookie: { maxAge: 60000 * 30 }  //失效时间（毫秒）
}))
// 设定  静态资源目录
app.use(express.static("static"))
app.use("/static/images", express.static("static/images"))


app.engine("html", require("ejs").__express)
app.set("view engine", "html")


// 检测是否登录（检测是否设置了session）
app.use(function (req, res, next) {
    // app.locals.userinfo={username:"张三"}
    if (req.url == "/login" || req.url == "/doLogin") {
        next()
    } else {
        if (req.session.userinfo && req.session.userinfo.username != "") {
            next()
        } else {
            next()
            res.redirect("/login");
        }
    }
})

// 登录
app.get("/login",(req,res)=>{
    res.render("login")
})
// 登录操作
app.post("/doLogin",(req,res)=>{
    let form = new multiparty.Form()
    form.parse(req,(err,fields,files)=>{
        let username = fields.username[0]
        let password = fields.password[0]
        MongoClient.connect(url,(err,client)=>{
            let collection = client.db("userInfo").collection("users")
            collection.findOne({username,password},(err,result)=>{
                if(err){
                    console.log(err)
                    return
                }
                // console.log(result,1111)
                if(result == null){
                    // 登录失败
                    res.send("<script>alert('用户名或密码错误');history.back();</script>")
                }else{
                    req.session.userinfo = result
                    app.locals['userinfo'] = result
                    res.redirect("typeList")
                }
            })
        })
    })
})

//退出登录
app.get("/logout", function (req, res) {
    req.session.userinfo = null;
    res.redirect("/login")
})

// 获取列表页信息
app.get("/bookList", (req, res) => {
    MongoClient.connect(url, (err, client) => {
        let collection = client.db("userInfo").collection("userInfo")
        collection.find({}).toArray((err, result) => {
            // console.log(result)
            let results = result.reverse()
            res.render("book/list", { "result": results })
        })
    })
})

// 渲染 添加页面
app.get("/bookAdd", (req, res) => {
    // console.log("001");return;
    res.render("book/add")
})

// 实现添加操作
app.post("/bookdoAdd", (req, res) => {
    var form = new multiparty.Form()
    form.uploadDir = "static/images"
    form.parse(req, (err, fields, files) => {
        let title = fields.title[0]
        let pic = files.pic[0].path
        let price = fields.price[0]
        let fee = fields.fee[0]
        let description = fields.description[0]
        let userInfo = {
            title,
            pic,
            price,
            fee,
            description
        }
        // console.log(userInfo)
        MongoClient.connect(url, (req, client) => {
            let collection = client.db("userInfo").collection("userInfo")
            collection.insertOne(userInfo, (err, result) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.send("<script>alert('添加成功');location.href='/bookList'</script>")
            })
        })
    })
})

// 渲染 修改页面
app.get("/bookEdit", (req, res) => {

    let id = require("mongodb").ObjectID(req.query.id)
    MongoClient.connect(url, (err, client) => {
        let collection = client.db("userInfo").collection("userInfo")
        collection.find({ _id: id }).toArray((err, result) => {
            if (err) {
                console.log(err)
                return
            }
            // console.log(result)
            let results = result[0]
            res.render("book/edit", { "result": results })
        })
    })
})
// 进行修改操作
app.post("/bookdoEdit", (req, res) => {
    let form = new multiparty.Form()
    form.uploadDir = "static/images"
    form.parse(req, (err, fields, files) => {
        let id = require("mongodb").ObjectID(fields.id[0])
        console.log(fields)
        let title = fields.title[0]
        let pic = files.pic[0].path
        let price = fields.price[0]
        let fee = fields.fee[0]
        let description = fields.description[0]
        // console.log(files)
        let originalFilename = files.pic[0].originalFilename
        if (originalFilename == '') {
            var updateData = {
                title,
                price,
                fee,
                description
            }
        } else {
            var updateData = {
                title,
                price,
                fee,
                description,
                pic
            }
        }
        MongoClient.connect(url, (err, client) => {
            let collection = client.db("userInfo").collection("userInfo")
            collection.updateOne({ _id: id }, { $set: updateData }, (err, result) => {
                if (err) {
                    console.log(err)
                    return
                }
                res.send("<script>alert('修改成功');location.href='/bookList'</script>")
            })
        })
    })
})

// 删除数据
app.get("/bookDel", (req, res) => {
    let id = require("mongodb").ObjectID(req.query.id)
    MongoClient.connect(url, (err, client) => {
        let collection = client.db('userInfo').collection('userInfo')
        collection.deleteOne({ _id: id }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            // console.log(result)
            res.send("<script>alert('删除成功');location.href='/bookList'</script>")
        })
    })
})

// 商品分类
// 渲染商品分类列表页
app.get("/typeList",(req,res)=>{
    MongoClient.connect(url,(err,client)=>{
        let collection = client.db("userInfo").collection("type")
        collection.find({}).toArray((err,result)=>{
            // console.log(result)
            let results = result.reverse()
            res.render("type/list",{"result":results})
        })
    })
})

// 渲染商品分类添加页
app.get("/typeAdd",(req,res)=>{
    // console.log("001")
    res.render("type/add")
})
// 进行商品分类的添加操作
app.post("/typedoAdd",(req,res)=>{
    let form = new multiparty.Form()
    form.uploadDir = "static/images"
    form.parse(req,(err,fields,files)=>{
        // console.log(fields)
        // console.log(files)
        let title = fields.title[0]
        let pic = files.pic[0].path
        let typeObj = {
            title,
            pic
        }
        MongoClient.connect(url,(err,client)=>{
            let collection = client.db("userInfo").collection("type")
            collection.insertOne(typeObj,(err,result)=>{
                if(err){
                    console.log(err)
                }
                res.send("<script>alert('添加成功');location.href='/typeList'</script>")
            })
        })
    })
})

// 商品分类 渲染修改页面
app.get("/typeEdit",(req,res)=>{
    let id = require("mongodb").ObjectID(req.query.id)
    console.log(id)
    MongoClient.connect(url,(err,client)=>{
        let collection = client.db("userInfo").collection("type")
        collection.find({_id:id}).toArray((err,result)=>{
            if(err){
                console.log(err)
                return
            }
            // console.log(result)
            res.render("type/edit",{"result":result[0]})
        })
    })

})

// 修改操作
app.post("/typedoEdit",(req,res)=>{
    let form = new multiparty.Form()
    form.uploadDir = "static/images"
    form.parse(req,(err,fields,files)=>{
        let id = require("mongodb").ObjectID(fields.id[0])
        let title = fields.title[0]
        let pic = files.pic[0].path
        
        let originalFilename = files.pic[0].originalFilename
        if(originalFilename == ''){
            var updateData = {
                title
            }
        }else{
            var updateData = {
                title,
                pic
            }
        }
        MongoClient.connect(url,(err,client)=>{
            let collection = client.db("userInfo").collection("type")
            collection.updateOne({_id:id},{$set:updateData},(err,result)=>{
                if(err){
                    console.log(err)
                    return
                }
                console.log(result)
                res.send("<script>alert('修改成功');location.href='/typeList'</script>")
            })
        })
    })
})

// 删除商品分类
app.get("/typeDel",(req,res)=>{
    let id = require("mongodb").ObjectID(req.query.id)
    MongoClient.connect(url,(err,client)=>{
        let collection = client.db("userInfo").collection("type")
        collection.remove({_id:id},(err,result)=>{
            if(err){
                console.log(err)
                return
            }
            res.send("<script>alert('删除成功');location.href='/typeList'</script>")
        })
    })
})


app.listen(3001, () => {
    console.log("----app----")
})
