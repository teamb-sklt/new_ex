var express = require('express');
var router = express.Router();
var {Client}=require('pg');

require('dotenv').config();
const user=process.env.USER;
const dbpassword=process.env.PASSWORD;


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
  console.log(account+pass);

  await client.connect()
  console.log(client)
  client.query("SELECT * from Employee where emp_no='"+account+"'", function(err, result){
    if (err){
      console.log(err) //show error infomation
    }
    let record = result.rows
    for(let i = 0; i <= result.rows; i++){
    record.push(result.rows[i])
  }
    if(result.rows[0].pw==pass){	//いったん全員が入れるように設定（必要であればif()の中に&&で条件を追加してください。）
        // let id=result.rows[0].emp_no;
        // let name=result.rows[0].emp_name;
        let a=result.rows[0];
        client.end();
        res.render('te_thismonth', opt);    //成功時の遷移先
    }else{
      client.end();
      res.redirect('/login')  //失敗時の遷移先
    }
  });
});

module.exports = router;