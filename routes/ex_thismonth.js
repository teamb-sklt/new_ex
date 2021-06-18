var express = require('express');
var router = express.Router();

var{Client}=require('pg');  //データベースを使うための宣言
const dbpassword = process.env.DBPW //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

var today=new Date();
var tomonth=today.getMonth()+1;
var todate=today.getDate();
var tmonth;
var lmonth;
var lastday;
if(today.getDate()>20){
  tmonth=today.getMonth()+2;
  lmonth=today.getMonth()+1;
}else{
  tmonth=today.getMonth()+1;
  lmonth=today.getMonth();
  lastday = 20 - today.getDate();
}
var id=[];
var date0=[];
var month=[];
var date=[];
var shuppatsu=[];
var totyaku=[];
var keiyu=[];
var shudan=[];
var money=[];
var times=[];
var job=[];
var memo=[];
var shinsei=[];
var id2=[];
var date02=[];
var month2=[];
var date2=[];
var shuppatsu2=[];
var totyaku2=[];
var keiyu2=[];
var shudan2=[];
var money2=[];
var times2=[];
var job2=[];
var memo2=[];
var shinsei2=[];

router.get('/', async function(req, res, next) { 
let opt={
  title: '経費',
  tmonth:tmonth,
  lmonth:lmonth,
  lastday:lastday,
}
  res.render('ex_thismonth', opt);
})

module.exports = router;
