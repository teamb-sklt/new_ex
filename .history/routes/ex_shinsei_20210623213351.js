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
    function job_manager(){
      return client
        .query("SELECT job_manager from ExDetail WHERE sheet_month='"+tmonth+"'"+ "AND status='00'")
        .then(res =>{return job_manager_no = res.rows[0].job_manager;})
        .then (res1 => console.log(job_manager_no))
        .catch(e => console.error(e.stack))
  }
  

  function emp_mail(){
      return client
        .query("SELECT emp_mail from Employee WHERE emp_no='"+job_manager_no +"'")
        .then(res =>{return job_manager_emp_mail = res.rows[0].emp_mail;})
        .then(res =>console.log(job_manager_emp_mail))
        // .catch(e => console.error(e.stack))
  }

  function shinsei(){
    client
      .query("UPDATE ExDetail SET status='11' WHERE emp_no='001' AND status='00' AND sheet_month="+ "'" + tmonth +"'" )
      .then(res => res)
      .then(res.redirect("/ex_thismonth"))
      .catch(e => console.error(e.stack))
      // client.end()
  }

    async function inoue(){
      await job_manager();

      emp_mail();
      shinsei();
    }
    //関数の呼び出し
    inoue();
})
module.exports = router;