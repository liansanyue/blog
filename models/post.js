/**
 * Created by Administrator on 2016/4/4.
 */
var mongodb=require('../models/db');
var markdown=require("markdown").markdown;
function Post(name,title,post){
    this.name=name;
    this.title=title;
    this.post=post;
}
module.exports=Post;
Post.prototype.save= function (callback) {
    var date=new Date();
    //存储各种时间格式，方便以后扩展
    var time={
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear()+"-"+(date.getMonth()+1),
        date:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate()),
        minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate())+" "+date.getHours()+":"+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()),
        second:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+(date.getDate())+" "+date.getHours()+":"+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())+":"+(date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds())

    }
    //要存入数据库的文档
    var post={
        name:this.name,
        time:time,
        title:this.title,
        post:this.post,
        comments:[],//评论

    };
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.insert(post,{
                safe:true
            }, function (err) {
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null);

            });
        });
    });
};
Post.getAll=function(name,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query={};
            if(name){
                query.name=name;
            }
            //根据query对象查询文章
            collection.find(query).sort({time:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                docs.forEach(function (doc) {
                    doc.post=markdown.toHTML(doc.post);
                });

                callback(null,docs);
            });

        });
    });
};
Post.getOne=function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }

            //根据query对象查询文章
            collection.findOne({"name":name,"time.date":day,"title":title},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                    doc.post=markdown.toHTML(doc.post);
                    doc.comments.forEach(function (conmment) {
                        conmment.content=markdown.toHTML(conmment.content);
                    })

                callback(null,doc);
            });

        });
    });
};
Post.getTen=function(name,page,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query={};
            if(name){
                query.name=name;
            }
          collection.count(query,function(err,total){
              collection.find(query,{
                  skip:(page-1)*5,//跳过指定数量的数据
                  limit:5
              }).sort({time:-1}).toArray(function(err,docs){
                  mongodb.close();
                  if(err){
                      return callback(err);
                  }
                  docs.forEach(function (doc) {
                      doc.post=markdown.toHTML(doc.post);
                  });

                  callback(null,docs,total);
              });
          });


        });
    });
};
Post.edit=function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts', function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }

            //根据query对象查询文章
            collection.findOne({"name":name,"time.date":day,"title":title},function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }


                callback(null,doc);
            });

        });
    });
};
Post.update=function(name,day,title,post,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.update({"name":name,"time.date":day,"title":title},{
                $set:{post:post}
            }, function (err) {
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null);

            });
        });
    });
}
Post.remove=function(name,day,title,callback){
    //打开数据库
    mongodb.open(function (err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //将文档插入posts集合
            collection.remove({"name":name,"time.date":day,"title":title},{
              w:1
            }, function (err) {
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null);

            });
        });
    });
}