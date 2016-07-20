/**
 * Created by Administrator on 2016/4/6.
 */
/**
 * Created by Administrator on 2016/4/4.
 */
var mongo = require('mongodb');
var mongodb=require('../models/db');
var markdown=require("markdown").markdown;
function Comment(_id,comment){
    this._id=_id;
    this.comment=comment;
}
module.exports=Comment;
Comment.prototype.save= function (callback) {
    var _id=new mongo.ObjectID(this._id),
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
            collection.update({"_id":_id},{
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
Comment.getOne=function(id,callback){
    //打开数据库
    var  _id=new mongo.ObjectID(id)
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


            collection.findOne({"_id":_id},function(err,doc){

                if(err){
                    return callback(err);
                }


                callback(null,doc);
            });

        });
    });
};