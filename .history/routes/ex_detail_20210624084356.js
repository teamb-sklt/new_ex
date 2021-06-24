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


if(date>20){
  tmonth=moment().add(1,'month').format("MM");
  lmonth=tomonth;
}else{
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  lastday = 20 - date;
}
console.log(tmonth)


//枝番を取得
var branch_no1;
var branch_no2;
var branch_no;

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
          console.log(branch_no1)
    
          client.end()
        });
    let opt={
        title: '（経費）詳細変更ページ',
        message: '各項目を入力してください',
        price: '',
        year: '',
        month:'',
        day:'',
        sStart: '',
        sWaypoint: '',
        sGoal: '',
    }
    res.render('ex_detail',opt);
  });


//ページが読み込まれた際の初期画面
router.post('/', async function(req, res, next) {
    //Ex_thismonthの詳細ボタンを押されたとき
    if(req.body.ex_detail){
        let branch_no2 = req.body.branch_no;
        console.log(branch_no2)

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
    
        client.query("SELECT * FROM ExDetail WHERE branch_no='"+branch_no2 +"'" +"AND sheet_month='"+tmonth+"'; SELECT * FROM ExComments WHERE sheet_year='2021' AND sheet_month='"+tmonth+"'AND branch_no='"+branch_no2+"'" ,function(err,result){
          if(err){
            console.log('error')
          }else{
            console.log(result[0].rows)
            console.log(result[1].rows)
            branch_no2=result[0].rows[0].branch_no
            year=result[0].rows[0].year;
            month=result[0].rows[0].month;
            day=result[0].rows[0].day;
            code_name=result[0].rows.code_name;
            payee=result[0].rows.payee;
            amount=result[0].rows[0].month;
            summary=result[0].rows[0].summary;
            job_no=result[0].rows[0].job_no;
            job_manager=result[0].rows[0].job_manager;
            claim_flag=result[0].rows[0].claim_flag;
            charge_flag=result[0].rows[0].charge_flag;
            ref_no=result[0].rows[0].ref_no;
            remarks=result[0].rows[0].remarks;
            app_class=result[1].rows[0].app_class;
            app_flag=result[1].rows[0].app_flag;
            comment=result[1].rows[0].comment;
          }
          client.end()
    let opt={
      title: '経費',
      branch_no2:branch_no2,
      code_name:code_name,
      payee:payee,
      amount:amount,
      year:year,
      month:month,
      day:day,
      summary:summary,
      job_no:job_no,
      job_name:'',
      job_manager_name:'',
      summary:summary,
      year:year,
      month:month,
      day:day,
      amount:amount,
      job_no:job_no,
      job_manager:job_manager,
      claim_flag:claim_flag,
      charge_flag:charge_flag,
      ref_no:ref_no,
      remarks:remarks,
      app_class:app_class,
      app_flag:app_flag,
      comment:comment,
    }
    res.render('ex_detail', opt);
    }) 
    //保存ボタンが押されたときに実行
} else if (req.body.save){
    console.log(req.body.save)
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
  const sql = "UPDATE ExDetail SET emp_no=dEmpno, sheet_year=year, sheet_month=tmonth, branch_no=branch_no2, year=dYear, month=dMonth, day=dDay, code_name=dCodename, payee=dPayee, summary=dSummary, amount=dPrice, job_no=dJobno, job_manager=dJobmanager, claim_flag=dClaimflag, charge_flag=dChargeflag, ref_no=dRefno, status=dStasus, remarks=dMemo, new=dNew, new_date=dNewdate, renew=dNew, renew_date=dNewdate WHERE sheet_month="+"'"+tmonth+"'";
  const values = [dEmpno,year,tmonth,branch_no2,dYear,dMonth,dDay,dCodename,dPayee,dSummary,dPrice,dJobno,dJobmanager,dClaimflag,dChargeflag,dRefno,dStasus,dMemo,dNew,dNewdate,dNew,dNewdate];
  console.log(values)
  client.query(sql, values)
  .then(res => {
      console.log(res)
      client.end()
  })
  .catch(e => console.error(e.stack));
  response.redirect("/ex_thismonth");
}
});

module.exports = router;