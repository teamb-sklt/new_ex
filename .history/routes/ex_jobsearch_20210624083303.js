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

  function syutoku() {
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
              job_id:job_id,
              job_name:job_name,
              job_manager:job_manager,
              job_manager_name:job_manager_name,
            }
            response.render('ex_jobsearch', opt);
        }
        client.end()
      })   
    }else{
      client.query("SELECT * FROM Job WHERE job_id LIKE "+"'"+jobsearchcode+"'",function(err,result){
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
              job_id:job_id,
              job_name:job_name,
              job_manager:job_manager,
              job_manager_name:job_manager_name,
            }
            response.render('ex_jobsearch', opt);
        }
        client.end()
      })
    }
}
syutoku()

  
})

module.exports = router;