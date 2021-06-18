var express = require('express');
var router = express.Router();


var{Client}=require('pg');  //データベースを使うための宣言
const dbpassword = process.env.DBPW //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

var today=new Date();
var tomonth=today.getMonth()+1;
var date =today.getDate();
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
var day = [];
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
  client.query('SELECT * from TeDetail',function(err,result){
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
    password: 'teama',
    port: 5432
  })
  await client.connect()

  client.query("UPDATE TeDetail SET count=count+1, remarks=concat(remarks,"+"'," +tomonth+"/"+date+"') where branch_no="+"'"+branch_no+"'"+"AND month="+"'"+month+"'"+"AND day="+"'"+day+"'",function(err,result){
    if (err) {
      console.log(err); //エラー時にコンソールに表示
    } else {
    console.log(result)
    }
    client.end()
    res.redirect('/te_thismonth')
  });
});

module.exports = router;
