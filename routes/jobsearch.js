const { query } = require('express');
var express = require('express');
var router = express.Router();
const { response } = require('express');
var express = require('express');
require('dotenv').config();

var { Client, Client } = require('pg');  //データベースを使うための宣言
const dbpassword = process.env.PASSWORD //DBを使うのに必要
const apiKey = process.env.APIKEY //APIkeyを使うのに必要
var query1;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('jobsearch', { title: 'Express' });
});

router.post('/', async function(req,response,next){
  let jobcode = req.body.code;
  let jobname = req.body.jobname;

  if(jobcode ===''){
    const query1 = "SELECT * FROM Job WHERE job_name LIKE '"+jobname+"'";
    console.log(query1)
  }else{
    const query1 = "SELECT * FROM Job WHERE job_id LIKE "+"'"+jobcode+"'";
    console.log(query1)
  }

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


  client.query(query1,function(err,result){
    if (err) {
      console.log(err); //エラー時にコンソールに表示
    } else {
    console.log(result)
    }
    client.end()


})
})

module.exports = router;