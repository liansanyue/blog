/**
 * Created by Administrator on 2016/4/4.
 */
var mongodb=require('../models/db');
var marked = require('marked');
var hightlight=require('highlight.js');
var markdownString = '```js\n console.log("hello"); \n```';
 var select={"name":1,"time":1,"title":1,"summary":1,"comments":1,"pv":1,"tags":1,"like":1};
marked.setOptions({
    highlight: function (code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' }, code, function (err, result) {
            callback(err, result.toString());
        });
    }
});

marked.setOptions({
    highlight: function (code) {
        return hightlight.highlightAuto(code).value;
    }
});


function Post(name,title,tags,post){
    this.name=name;
    this.title=title;
    this.post=post;
    this.tags=tags;
    this.summary=post.substr(0,100);
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
    var second=date.getTime();
    //要存入数据库的文档
    var post={
        name:this.name,
        time:time,
        second:second,
        title:this.title,
         summary:this.summary,
        post:this.post,
        tags:this.tags,
        comments:[],//评论
        pv:0,
        like:0

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
            collection.find(query,select).sort({second:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }


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

                if(err){
                    return callback(err);
                }

                if(doc){
                    collection.update({"name":name,"time.date":day,"title":title},{ $inc:{pv:1}},function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    });


                }
                if(doc){doc.post=marked(doc.post);}
                
                console.log(doc)
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
                collection.find(query,select,{
                    skip:(page-1)*5,//跳过指定数量的数据
                    limit:5
                }).sort({second:-1}).toArray(function(err,docs){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
               /*     docs.sort(function(x,y){
                        if(x.time.second>y.time.second)
                        return 1;
                        else
                            return -1;
                    })*/
                    docs.forEach(function(doc,index){

                        doc.summary=marked(doc.summary);
                    })
                    callback(null,docs,total);
                });
            });


        });
    });
};
Post.getArchive=function(callback){
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


            collection.find({},{"name":1,"time":1,"title":1}).sort({second:-1}).toArray(function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                console.log(docs)
                callback(null,docs);
            });

        });
    });
};
Post.getTags=function(callback){
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

//distinct用来给出给定键的所有不同值.[ 'css', 'html', 'js', '' ]
            collection.distinct("tags",function(err,docs){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                callback(null,docs);
            });

        });
    });
};
Post.getTag=function(tag,callback){
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
            if(tag){
                query.tags=tag;
            }
            collection.count(query,function(err,total){
                collection.find(query,{
                    "name":1,
                    "time":1,
                    "title":1
                }).sort({second:-1}).toArray(function(err,docs){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }

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
Post.update=function(name,day,title,tags,post,callback){
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
            var summary=post.substr(0,100)
            collection.update({"name":name,"time.date":day,"title":title},{
                $set:{post:post,tags:tags,summary:summary}
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
Post.search=function(keyword,callback){
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            var pattern=new RegExp(keyword,"i");
            collection.find({"title":pattern},{
                "name":1,
                "time":1,
                "title":1
            }).sort({second:-1}).toArray(function (err,docs) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            })
        })
    })
}