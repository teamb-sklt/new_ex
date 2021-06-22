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

if(date>20){
  tmonth=moment().add(1,'month').format("MM");
  lmonth=tomonth;
}else{
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  lastday = 20 - date;
}

router.post('/', async function(req, res, next) {
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

    // let emp_no = req.body.emp_no
      //Postgraseへレコード追加
  const query = "UPDATE ExDetail SET status='11' WHERE emp_no='001' AND status='00' AND sheet_month="+ "'" + tmonth +"'" ;

  // client.query(query)
  // .then(res => console.log(res.rows[0]))
  // .catch(e => console.error(e.stack))

    client.query(query ,function(err,result){
      console.log(query)
    
    client.end()
    res.redirect("/ex_thismonth");
  })
})
module.exports = router;