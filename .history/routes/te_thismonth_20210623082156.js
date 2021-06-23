const { response } = require('express');
var express = require('express');
var router = express.Router();
const moment = require("moment");
require('dotenv').config();

var { Client, Client } = require('pg');  //データベースを使うための宣言
const dbpassword = process.env.PASSWORD //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

var today = moment();
var year = moment().format("YYYY");
var tomonth = moment().format("MM");
// var nm = moment().add(1,'month').format("MM");　//翌月
// var lm = moment().add(-1,'month',).format("MM");　//先月
var date = moment().format("DD")
var tmonth;
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
var status = [];
var branch_no = [];
var month = [];
var day = [];
var trans_from = [];
var trans_to = [];
var amount = [];
var count = [];
var subtotal = [];
var job_no = [];
var emp_no = "001"

/* GET users listing. */
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
    password: dbpassword,
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
  client.query("SELECT * from TeDetail WHERE sheet_month="+"'"+tmonth+"'" +"ORDER BY branch_no ASC",function(err,result){
    // console.log(result)
    for(var i in result.rows){
      status[i]=result.rows[i].status;
      branch_no[i]=result.rows[i].branch_no;
      month[i]=result.rows[i].month;
      day[i]=result.rows[i].day;
      trans_from[i]=result.rows[i].trans_from;
      trans_to[i]=result.rows[i].trans_to;
      amount[i]=result.rows[i].amount;
      count[i]=result.rows[i].count;
      subtotal[i]=result.rows[i].count * result.rows[i].amount;
      job_no[i]=result.rows[i].job_no;

      // console.log(i)                  
    }
    client.end()
  });
  let opt={
    title: '交通費',
    emp_no:emp_no,
    tmonth:tmonth,
    lmonth:lmonth,
    lastday:lastday,
    date:date,
    status:status,
    branch_no:branch_no,
    month:month,
    day:day,
    trans_from:trans_from,
    trans_to:trans_to,
    amount:amount,
    count:count,
  subtotal:subtotal,
  job_no:job_no,
}
  res.render('te_thismonth', opt);
})

//+1を押すとき
router.post('/',async function(req,res,next){
  let branch_no = req.body.branch_no;
  let month = req.body.month; //本来なら、Monthやdayではなく、報告年月と社員番号が必要。
  let day = req.body.day;
  console.log(branch_no+month+day);

  const client = (process.env.ENVIRONMENT == "LIVE") ? new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
  }) : new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'itpjph3',
    password: dbpassword,
    port: 5432
  })
  await client.connect()

  client.query("UPDATE TeDetail SET count=count+1, remarks=concat(remarks,"+"'," +tomonth+"/"+date+"') where branch_no="+"'"+branch_no+"'"+"AND month="+"'"+month+"'"+"AND day="+"'"+day+"'",function(err,result){
    if (err) {
      console.log(err); //エラー時にコンソールに表示
    } else {
    // console.log(result)
    }
    client.end()
    res.redirect('/te_thismonth')
  });
});

module.exports = router;
