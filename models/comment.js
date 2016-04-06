/**
 * Created by Administrator on 2016/4/6.
 */
/**
 * Created by Administrator on 2016/4/4.
 */
var mongodb=require('../models/db');
var markdown=require("markdown").markdown;
function Comment(name,day,title,comment){
    this.name=name;
    this.day=day;
    this.title=title;
    this.comment=comment;
}
module.exports=Comment;
Comment.prototype.save= function (callback) {
    var name=this.name,
        day=this.day,
        title=this.title,
        comment=this.comment;
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
                $push:{comments:comment}
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
