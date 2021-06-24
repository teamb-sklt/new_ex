const { query } = require('express');
var express = require('express');
var router = express.Router();
const { response } = require('express');
var express = require('express');
require('dotenv').config();
var ccc;

var { Client, Client } = require('pg');  //データベースを使うための宣言
const dbpassword = process.env.PASSWORD //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

/* GET home page. */
router.get('/', function(req, res, next) {
  let opt={
    job_id:'',
    job_name:'',
    job_manager:'',
    job_manager_name:'',
  }
  res.render('ex_jobsearch', opt);
});

router.post('/', async function(req,response,next){



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

  const jobsearchcode = req.body.jobsearchcode;
  const jobsearchname = req.body.jobsearchname;
  let code_name = req.body.code_name;
  let summary = req.body.summary;
  let payee = req.body.payee;
  let year = req.body.year;
  let month = req.body.month;
  let day = req.body.day;
  let branch_no2 = req.body.branch_no;
  console.log(year)
  console.log(branch_no2)
  console.log(jobsearchname)
  console.log(jobsearchcode)


    if(jobsearchcode ===''){
      client.query("SELECT * FROM Job WHERE job_name LIKE '%"+　jobsearchname　+"%'",function(err,result){
        if (err) {
          console.log(err); //エラー時にコンソールに表示
        } else {
          let job_id=[]
          let job_name=[]
          let job_manager=[]
          let job_manager_name=[]

          for(var i in result.rows){
            job_id.push(result.rows[i].job_id)
            job_name.push(result.rows[i].job_name)
            job_manager.push(result.rows[i].job_manager)
            job_manager_name.push(result.rows[i].job_manager_name)
            }
            console.log(job_id)
            let opt={
              jobsearchcode:jobsearchcode,
              jobsearchname:jobsearchname,
              job_id:job_id,
              job_name:job_name,
              job_manager:job_manager,
              job_manager_name:job_manager_name,
              year:year,
              month:month,
              day:day,
              branch_no2:branch_no2,
              payee:payee,
              summary:summary,
              code_name:code_name,
            }
            response.render('ex_jobsearch', opt);
        }
        client.end()
      })   
    }else{
      client.query("SELECT * FROM Job WHERE job_id LIKE "+"'%"+jobsearchcode+"%'",function(err,result){
        if (err) {
          console.log(err); //エラー時にコンソールに表示
        } else {
          let job_id=[]
          let job_name=[]
          let job_manager=[]
          let job_manager_name=[]

          for(var i in result.rows){
            job_id.push(result.rows[i].job_id)
            job_name.push(result.rows[i].job_name)
            job_manager.push(result.rows[i].job_manager)
            job_manager_name.push(result.rows[i].job_manager_name)
            }
            console.log(job_id)
            let opt={
              jobsearchcode:jobsearchcode,
              jobsearchname:jobsearchname,
              job_id:job_id,
              job_name:job_name,
              job_manager:job_manager,
              job_manager_name:job_manager_name,
              year:year,
              month:month,
              day:day,
              branch_no2:branch_no2,
              payee:payee,
              summary:summary,
              code_name:code_name,
            }
            response.render('ex_jobsearch', opt);
        }
        client.end()
      })
    }

  
})

module.exports = router;