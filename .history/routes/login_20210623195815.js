var express = require('express');
var router = express.Router();
var {Client}=require('pg');
const moment = require("moment");
require('dotenv').config();
const user=process.env.USER;
const dbpassword=process.env.PASSWORD;

var today = moment();
var year = moment().format("YYYY");
var tomonth = moment().format("MM");
// var nm = moment().add(1,'month').format("MM");　//翌月
// var lm = moment().add(-1,'month',).format("MM");　//先月
var date = moment().format("DD")
var tmonth;
var lmonth;
var lastday;

// console.log(date)

if(date>20){
  tmonth=moment().add(1,'month').format("MM");
  lmonth=tomonth;
}else{
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  lastday = 20 - date;
}

/* GET home page. */
router.get('/',function(req,res,next){
    console.log(res);
    res.render('login',{
        title:'Login',
    });
});


router.post('/',async function(req, res, next) {
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
  let account=req.body.account;
  let pass=req.body.password;
  // console.log(account+pass);

  await client.connect()
  // console.log(client)
  client.query("SELECT * from TeDetail WHERE sheet_month="+"'"+tmonth+"'" +"ORDER BY branch_no ASC",function(err,result){
    if(err){
        console.log('error')
      }else{
        console.log(result)
      }
      
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
      emp_no:account,
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
  });
  

router.post('/te_thismonth',async function(req, res, next) {
    let emp_no = req.body.account;
    res.render('te_thismonth', {
      emp_no:emp_no
  });
});

module.exports = router;