const { response } = require('express');
var express = require('express');
var router = express.Router();
var moment = require("moment");
const fetch = require('node-fetch');
require('dotenv').config();
const user=process.env.USER;
const dbpassword=process.env.PASSWORD;
const apiKey = process.env.APIKEY //APIkeyを使うのに必要
var{Client}=require('pg');  //データベースを使うための宣言
const { search } = require('../app');

var today = moment();
var year = moment().format("YYYY");
var tomonth = moment().format("MM");
// var nm = moment().add(1,'month').format("MM");　//翌月
// var lm = moment().add(-1,'month',).format("MM");　//先月
var date = moment().format("DD")
var tmonth; //この変数に経費申請する月と同値が入る。
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

//保存するときのプライマリーキーに報告年、報告月、枝番が必要。

//枝番を取得
var branch_no1;
var branch_no2;
var branch_no;
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

    client.query("SELECT count(*) from ExDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '新規登録 - 経費',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
    amount:'',
    job_no:'',
    job_name:'',
    job_manager_name:'',
    code_name:'',
    payee:'',
    summary:'',
    job_manager:'',
    remarks:'',
    
  
  }
     res.render('ex_newrecord', opt);
    });


router.post('/', async function(req,response,next){
    //保存ボタンが押されたら実行

    if(req.body.jobsearch){
      let job_id = req.body.job_id
      let job_name = req.body.job_name
      let job_manager = req.body.job_manager
      let job_manager_name = req.body.job_manager_name
      let amount = req.body.amount
      let year = req.body.year;
      let month = req.body.month;
      let day = req.body.day;
      let branch_no2 = req.body.branch_no;
      let code_name = req.body.code_name;
      let summary = req.body.summary;
      let payee = req.body.payee;

      let opt={
        title: '新規登録 - 経費',
        job_no:job_id,
        job_name:job_name,
        job_manager:job_manager,
        job_manager_name:job_manager_name,
        code_name:code_name,
        summary:summary,
        payee:payee,
        branch_no2:branch_no2,
        year:year,
        month:month,
        day:day,
        amount:amount,
        remarks:'',

        // branch_no2:branch_no2,
        // trans_from:trans_from,
        // trans_waypoint:trans_waypoint,
        // trans_to:trans_to,
        // amount:amount,
    }
    response.render('ex_newrecord', opt);

  }  else if(req.body.ex_jobsearch_to){ //フォーム内を読み取り、ジョブ検索画面へ飛ばす
    let code_name = req.body.code_name;
    let summary = req.body.summary;
    let payee = req.body.payee;
    let year = req.body.year;
    let month = req.body.month;
    let day = req.body.day;
    let branch_no2 = req.body.branch_no;
    let jobsearchcode = req.body.job_no
    let jobsearchname = req.body.job_name
    // let job_manager = req.body.job_manager
    // let job_manager_name = req.body.job_manager_name
    let opt={
      jobsearchcode:jobsearchcode,
      jobsearchname:jobsearchname,
      job_manager:'',
      job_manager_name:'',
      code_name:code_name,
      summary:summary,
      payee:payee,
      branch_no2:branch_no2,
      year:year,
      month:month,
      day:day,
      job_id:'',
      remarks:'',
    }
    response.render('ex_jobsearch', opt);

  }
  else if(req.body.save){
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
      
    //フォームに入力された値を定義
    let dEmpno = '001'; //ログインID=社員IDに変更要
    let dYear = req.body.year;
    let dMonth = req.body.month;
    let dDay = req.body.day;
    let dCodename = req.body.code_name;
    let dPayee = req.body.payee;
    let dSummary = req.body.summary;
    let dPrice = req.body.amount;
    let dJobno = req.body.job_no;
    let dJobmanager = 111; //仮で111
    let dClaimflag = req.body.claim_flag;
    let dChargeflag = req.body.charge_flag;
    let dRefno = req.body.ref_no;
    let dStasus = '00'; //未申請ステータス
    let dMemo = req.body.remarks;
    let dNew = '001'; //ログインID=社員IDに変更要
    let dNewdate = req.body.year+req.body.month+req.body.day;

    //インサートコマンドを定義
    const sql = "INSERT INTO ExDetail (emp_no, sheet_year, sheet_month, branch_no, year, month, day, code_name, payee, summary, amount, job_no, job_manager, claim_flag, charge_flag, ref_no, status, remarks, new, new_date, renew, renew_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)";
    //const sql = "INSERT INTO ExDetail (emp_no, sheet_year, sheet_month, branch_no, year, month, day, code_name, payee, summary, amount, job_no, job_manager, claim_flag, charge_flag, ref_no, status, remarks, new, new_date, renew, renew_date ; INSERT INTO ExComments (emp_no, sheet_year, sheet_month, branch_no, app_class, job_manager, app_flag, comment, new, new_date, renew, renew_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22 ; $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)";
    const values = [dEmpno,year,tmonth,branch_no2,dYear,dMonth,dDay,dCodename,dPayee,dSummary,dPrice,dJobno,dJobmanager,dClaimflag,dChargeflag,dRefno,dStasus,dMemo,dNew,dNewdate,dNew,dNewdate];
    console.log(values)
    client.query(sql, values)
    .then(res => {
        console.log(res)
        client.end()
    })
    .catch(e => console.error(e.stack));
    response.redirect("/ex_thismonth");
  }else if(req.body.book){
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

    client.query("SELECT count(*) from ExDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '書籍登録',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
    amount:'',
    job_no:'SKLRAD0103',
    job_name:'SKLT書籍購入',
    job_manager_name:'新田さん',
    code_name:1,
    payee:'Amazon株式会社',
    summary:'書籍代',
    job_manager:'111',
    remarks:'',
    
  
  }
     response.render('ex_newrecord', opt);

  }else if(req.body.mtg){
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

    client.query("SELECT count(*) from ExDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '経費',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
    amount:'',
    job_no:'',
    job_name:'',
    job_manager_name:'',
    code_name:2,
    payee:'',
    summary:'',
    job_manager:'',
    remarks:'会社名:　名前:　役職:　人数:',
    
  
  }
     response.render('ex_newrecord', opt);
    
  }else if(req.body.kousai){
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

    client.query("SELECT count(*) from ExDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '交際費登録',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
    amount:'',
    job_no:'',
    job_name:'',
    job_manager_name:'',
    code_name:'',
    payee:'',
    summary:'',
    job_manager:'',
    remarks:'会社名:　名前:　役職:　人数:',
    
  
  }
     response.render('ex_newrecord', opt);
    
  }
});


module.exports = router;