const { response } = require('express');
var express = require('express');
var router = express.Router();
const moment = require("moment");
require('dotenv').config();

var { Client, Client } = require('pg');  //データベースを使うための宣言
const dbpassword = process.env.PASSWORD //DBを使うのに必要
const user=process.env.USER;
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
var nmonth;

// console.log(date)

if(date>20){
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  nmonth=moment().add(1,'month',).format("MM");
}else{
  tmonth=moment().add(-1,'month',).format("MM");
  lmonth=moment().add(-2,'month',).format("MM");
  nmonth=moment().add().format("MM");
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
var code_name = [];
var payee = [];
var summary = [];
var job_no = [];

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const client = (process.env.ENVIRONMENT == "LIVE") ? new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
  }) : new Client({
    user: user,
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
  client.query("SELECT * from ExDetail WHERE sheet_month="+"'"+tmonth+"'" +"ORDER BY branch_no ASC",function(err,result){
    // console.log(result)
    for(var i in result.rows){
      status[i]=result.rows[i].status;
      branch_no[i]=result.rows[i].branch_no;
      month[i]=result.rows[i].month;
      day[i]=result.rows[i].day;
      trans_from[i]=result.rows[i].trans_from;
      trans_to[i]=result.rows[i].trans_to;
      amount[i]=result.rows[i].amount;
      job_no[i]=result.rows[i].job_no;
      summary[i]=result.rows[i].summary;
      payee[i]=result.rows[i].payee;
      code_name[i]=result.rows[i].code_name;

      // console.log(i)                  
    }
    client.end()
  });
let opt={
  title: '経費',
  tmonth:tmonth,
  lmonth:lmonth,
  lastday:lastday,
  date:date,
  status:status,
  branch_no:branch_no,
  month:month,
  day:day,
  code_name:code_name,
  payee:payee,
  summary:summary,
  amount:amount,
  job_no:job_no,
}
  res.render('ex_lastmonth', opt);
})

//コピーを押すとき
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
    user: user,
    host: 'localhost',
    database: 'itpjph3',
    password: dbpassword,
    port: 5432
  })
  await client.connect()

  client.query("SELECT * FROM ExDetail where branch_no="+"'"+branch_no+"'"+"AND sheet_month="+"'"+tmonth+"';SELECT count(*) from ExDetail WHERE sheet_month="+"'"+nmonth+"'",function(err,result){ //ここでのtmonthは先月の今月。
    if (err) {
      console.log(err); //エラー時にコンソールに表示
    } else {
      branch_no=result[1].rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)
    console.log(result[0])
    console.log(result[1])
    code_name=result[0].rows[0].code_name;
    payee=result[0].rows[0].payee;
    summary=result[0].rows[0].summary;
    amount=result[0].rows[0].amount;
    count=result[0].rows[0].count;
    job_no=result[0].rows[0].job_no;
    job_manager=result[0].rows[0].job_manager;
    claim_flag=result[0].rows[0].claim_flag;
    charge_flag=result[0].rows[0].charge_flag;
    ref_no=result[0].rows[0].ref_no;
    remarks=result[0].rows[0].remarks;
  let opt={
    title: 'データコピー',
    branch_no2:branch_no2,
    year:'',
    month:'',
    day:'',
    code_name:code_name,
    payee:payee,
    summary:summary,
    amount:amount,
    count:count,
    job_no:job_no,
    job_name:'',
    job_manager_name:'',
    job_manager:job_manager,
    claim_flag:claim_flag,
    charge_flag:charge_flag,
    ref_no:ref_no,
    remarks:remarks,
    }
    res.render('ex_newrecord', opt);
}
  // }
  client.end()

});
});

module.exports = router;
