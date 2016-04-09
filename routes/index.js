//var express = require('express');
//var router = express.Router();
//
///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});
//
//module.exports = router;
var fs = require('fs');
var crypto=require('crypto');
var User=require("../models/user.js");
var Post=require("../models/post.js");
var Comment=require('../models/comment.js');

module.exports=function (app){
  app.get("/blog",function(req,res){
    res.render('blog')
  })
  app.get("/",function(req,res){
    console.log(req.connection.remoteAddress);
    var page=req.query.p?parseInt(req.query.p):1;
    Post.getTen(null,page,function(err,posts,total){
      if(err){
        posts=[];
      }
      //console.log(req.session.user.ops[0].name);
      res.render("index",{title:"主页",
        user:req.session.user,
        posts:posts,
        page:page,
        isFirstPage:(page-1)==0,
        isLastPage:((page-1)*10+posts.length)==total,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    })

  });
  app.get('/reg',checkNotLogin);
  app.get("/reg",function(req,res){
    res.render("reg",{title:"注册",
                      user:req.session.user,
                      name:req.session.username,
                      success:req.flash('success').toString(),
                      error:req.flash('error').toString()});
  });
  app.post('/reg',checkNotLogin);
  app.post("/reg",function(req,res){

    var name=req.body.name,
        password=req.body.password,
        password_re=req.body['password-repeat'];
    //检验用户两次输入的密码是否一致

    if(password_re!=password){
      req.flash('error','两次输入的密码不一致');
      return res.redirect('/res');//返回注册页
    }
    //生成密码的MD5值

    var md5=crypto.createHash('md5'),
        password=md5.update(req.body.password).digest('hex');
    var newUser=new User({
      name:req.body.name,
      password:password,
      email:req.body.email
    });
    //检查用户是否已经存在
    User.get(newUser.name,function(err,user){
      if(err){
        req.flash('error',err);
        return res.redirect('/')
      }
      if(user){

        req.flash('error','用户已经存在')
        return res.redirect('/reg');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function(err,user) {
        if(err){
          req.flash('error',err);
          return res.redirect('/reg');//注册失败返回注册
        }
        req.session.username=newUser.name;
        req.session.user=user;
        req.flash('success','注册成功');
        res.redirect('/');

      });
    });
  });
  app.get('/login',checkNotLogin);
  app.get("/login",function(req,res){
    res.render("login",{title:"登录",
      user:req.session.user,
      name:req.session.username,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()});
  });
  app.post('/login',checkNotLogin);
  app.post("/login",function(req,res){
    //生成密码MD5的值
    var md5=crypto.createHash('md5'),
        password=md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    var newUser=new User({
      name:req.body.name,
      password:password,
      email:req.body.email
    });
    User.get(newUser.name,function(err,user) {
      if (!user) {
        req.flash('error', '用户不存在');
        return res.redirect('/login')
      }
      if(user.password!=password){
        req.flash('error','密码错误');
        return res.redirect('/login');
      }
      req.session.username=newUser.name;
      req.session.user=user;
      req.flash('success','登陆成功');
      res.redirect('/');
    })
  });
  app.get('/post',checkLogin);
  app.get("/post",function(req,res){
    res.render("post",{title:"发表",
      user:req.session.user,
      name:req.session.username,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()});
  });
  app.post('/post',checkLogin);
  app.post("/post",function(req,res){
  //var currentUser=req.session.user;
    //console.log(currentUser.name);
    var tags=[req.body.tag1,req.body.tag2,req.body.tag3];
      var post=new Post(req.session.username,req.body.title,tags,req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      req.flash('success','发布成功');
      res.redirect('/');
    })
  });
  app.get('/logout',checkLogin);
  app.get("/logout",function(req,res){
    req.session.user=null;
    req.session.username=null;
    req.flash('success','注销成功');
    res.redirect('/');
  });
  app.get('/upload',checkLogin);
  app.get('/upload',function(req,res){
    res.render("upload",{title:"上传",
      user:req.session.user,
      name:req.session.username,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()});

  });
  app.post('/upload',checkLogin);
  app.post("/upload",function(req,res){

   req.flash('success','文件上传成功');
    res.redirect('/upload')
  });
app.get('/archive',function(req,res){
    Post.getArchive(function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render("archive",{title:"存档",

        user:req.session.user,
        posts:posts,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });

    })
  })
  app.get('/tags',function(req,res){
    Post.getTags(function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }

      res.render("tags",{title:"标签",

        user:req.session.user,
        posts:posts,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });

    })
  })
  app.get('/tags/:tag',function(req,res){
    Post.getTag(req.params.tag,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
    console.log(posts)
      res.render("archive",{title:"Tags:"+req.params.tag,

        user:req.session.user,
        posts:posts,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });

    })
  })
app.get("/u/:name",function(req,res){
  var page=req.query.p?parseInt(req.query.p):1;
  User.get(req.params.name,function(err,user){

    if(!user){
      req.flash('error','用户不存在');
      return res.redirect('/');
    }
    Post.getTen(user.name,page,function(err,posts,total){
      if(err){
        req.flash('error',error);
        return res.redirect('/');
      }
      if(posts){
      res.render("index",{title:user.name,
        user:req.session.user,
        posts:posts,
        page:page,
        isFirstPage:(page-1)==0,
        isLastPage:((page-1)*10+posts.length)==total,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
      }else{
        req.flash('error','不存在');
        return res.redirect('back');
      }
    })

  })
})

  app.get("/u/:name/:day/:title",function(req,res){

    User.get(req.params.name,function(err,user){

      if(!user){
        req.flash('error','用户不存在');
        return res.redirect('/');
      }
      Post.getOne(user.name,req.params.day,req.params.title,function(err,posts){
        if(err){
          req.flash('error','发生错误');
          return res.redirect('/');
        }

        if(posts){

        res.render('article',{
          title:user.name,
          name:req.session.username,
          posts:posts,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
        }else{
          req.flash('error','不存在');
          return res.redirect('back');
        }
      })
    })
  })
  app.post("/u/:name/:day/:title",function(req,res){
    var date=new Date(),
        time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate())+" "+date.getHours()+":"+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
    var comment={
      name:req.body.name,
      email:req.body.email,
      website:req.body.website,
      time:time,
      content:req.body.content
    }

    var newComment=new Comment(req.params.name,req.params.day,req.params.title,comment);
    newComment.save(function (err) {
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      req.flash('success','留言成功！');
      res.redirect('back')

    })


  })
  app.get('/edit/:name/:day/:title',checkLogin);
  app.get("/edit/:name/:day/:title",function(req,res){
    //================  多一层判断  ==============
   if(req.params.name!=req.session.user.name){
     req.flash('error','没有权限');
     return res.redirect('back');
   }
    //===========================================
      Post.edit(req.session.user.name,req.params.day,req.params.title,function(err,posts){
        if(err){
          req.flash('error',error);
          return res.redirect('back');
        }
        //if(posts==null){
        //  req.flash('error','没有权限');
        //  return res.redirect('back');
        //}
        if(posts){
        res.render('edit',{
          title:'编辑',
          name:req.session.user.name,
          posts:posts,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })}else{
          req.flash('error','不存在');
          return res.redirect('back');
        }
      })

  })
  app.post('/edit/:name/:day/:title',checkLogin);
  app.post("/edit/:name/:day/:title",function(req,res){
   var tags=[req.body.tag1,req.body.tag2,req.body.tag3];
    Post.update(req.session.user.name,req.params.day,req.params.title,tags,req.body.post,function(err){
      var url=encodeURI('/u/'+req.params.name+'/'+req.params.day+"/"+req.params.title);
      if(err){
        req.flash('error',error);
        return res.redirect('back');
      }

     req.flash('success','修改成功');
      res.redirect(url);
    })

  })
  app.get('/remove/:name/:day/:title',checkLogin);
  app.get("/remove/:name/:day/:title",function(req,res){
    //================  多一层判断  ==============
    if(req.params.name!=req.session.user.name){
      req.flash('error','没有权限');
      return res.redirect('back');
    }
    //===========================================
    Post.remove(req.session.user.name,req.params.day,req.params.title,function(err,posts){
      if(err){
        req.flash('error',error);
        return res.redirect('back');
      }
      req.flash('success','删除成功');
      res.redirect('/');
    })

  })
  app.get("/search",function(req,res){

    Post.search(req.query.search,function(err,posts){
      if(err){
        req.flash('error',error);
        return res.redirect('back');
      }
      res.render("search",{title:"search:"+req.query.search,

        user:req.session.user,
        posts:posts,
        name:req.session.username,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    })

  })
//app.post('/ajax',function(req,res){
////测试ajax
//  res.send("返回的数据");
//})
app.use(function(req,res){
  res.render("404")
  ;})
}
function checkLogin(req,res,next){
  if(!req.session.user){
    req.flash('error','未登录!');
    res.redirect('/login');
  }
  next();
}
function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登录!');
    res.redirect('back');
  }
  next();
}
