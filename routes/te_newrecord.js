var express = require('express');
var router = express.Router();
var moment = require("moment");

var{Client}=require('pg');  //データベースを使うための宣言
const dbpassword = process.env.DBPW //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

var today = moment();
var year = moment().format("YYYY");
var tomonth = moment().format("MM");
// var nm = moment().add(1,'month').format("MM");　//翌月
// var lm = moment().add(-1,'month',).format("MM");　//先月
var date = moment().format("DD")
var tmonth; //この変数に経費申請する月と同値が入る。
var lmonth;
var lastday;

console.log(date)

if(date>20){
  tmonth=moment().add(1,'month').format("MM");
  lmonth=tomonth;
}else{
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  lastday = 20 - date;
}
console.log(tmonth)

//保存するときのプライマリーキーに報告年、報告月、枝番が必要。

//枝番を取得
var branch_no1;
var branch_no2;
var branch_no;
router.get('/', async function(req, res, next) {
    const client = (process.env.ENVIRONMENT == "LIVE") ? new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
          rejectUnauthorized: false
      }
    }) : new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'itpjph3',
      password: 'teama',
      port: 5432
    })
    await client.connect()
    // console.log(client)
    // client.query('SELECT * from example', function(err, result){
    //   if (err){
    //     console.log(err) //show error infomation
    //   }
    //   console.log(result)
    // })
    client.query("SELECT count(*) from TeDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
    branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '交通費',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
    // // status:status,
    // branch_no:branch_no,
    // month:month,
    // day:day,
    // trans_from:trans_from,
    // trans_to:trans_to,
    // amount:amount,
    // count:count,
    // subtotal:subtotal,
    // job_no:job_no,
     }
    res.render('te_newrecord', opt);
  })
  




module.exports = router;