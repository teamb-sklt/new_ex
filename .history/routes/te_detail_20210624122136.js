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
      user: 'postgres',
      host: 'localhost',
      database: 'itpjph3',
      password: dbpassword,
      port: 5432
    })
    await client.connect()

    client.query("SELECT count(*) from TeDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      console.log(branch_no1)

      client.end()
    });
  let opt={
    title: '交通費詳細変更',
    year:year,
    month:month,
    day:day,
    branch_no:branch_no1,
    trans_from:trans_from,
    trans_waypoint:trans_waypoint,
    trans_to:trans_to,
    amount:'',
    // // status:status,
    // branch_no:branch_no,
    // month:month,
    // day:day,
    // trans_from:trans_from,
    // trans_to:trans_to,
    // amount:amount,
    // count:count,
    // subtotal:subtotal,
    // job_no:job_no,
     }
     res.render('te_detail', opt);
    });



router.post('/', async function(req,response,next){
    //te_thismonthの詳細ボタンを押された場合実行
    if(req.body.te_detail){
      let branch_no2 = req.body.branch_no
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

    client.query("SELECT * FROM TeDetail WHERE branch_no='"+branch_no2 +"'" +"AND sheet_month='"+tmonth+"'; SELECT * FROM TeComments WHERE sheet_year='2021' AND sheet_month='"+tmonth+"'AND branch_no='"+branch_no2+"'" ,function(err,result){
      if(err){
        console.log('error')
      }else{
      // console.log(result[0])
      // console.log(result[1])
      branch_no2=result[0].rows[0].branch_no
      trans_from=result[0].rows[0].trans_from;
      trans_to=result[0].rows[0].trans_to;
      trans_waypoint=result[0].rows[0].trans_waypoint;
      trans_type=result[0].rows[0].trans_type;
      year=result[0].rows[0].year;
      month=result[0].rows[0].month;
      day=result[0].rows[0].day;
      amount=result[0].rows[0].amount;
      count=result[0].rows[0].count;
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
      title: '交通費',
      branch_no2:branch_no2,
      trans_from:trans_from,
      trans_waypoint:trans_waypoint,
      trans_to:trans_to,
      trans_type:trans_type,
      amount:amount,
      year:year,
      month:month,
      day:day,
      count:count,
      job_no:job_no,
      job_name:'',
      job_manager_name:'',
      job_manager:job_manager,
      claim_flag:claim_flag,
      charge_flag:charge_flag,
      ref_no:ref_no,
      remarks:remarks,
      app_class:app_class,
      app_flag:app_flag,
      comment:comment,
    }
    response.render('te_detail', opt);
    })
    }else if(req.body.search){
        //経路選択画面からPOSTで引っ張ってくる
        let trans_from = req.body.trans_from;
        let trans_waypoint = req.body.trans_waypoint;
        let trans_to = req.body.trans_to;
        let branch_no2 = req.body.branch_no;
        let amount = req.body.amount;

            let opt={
                title: '交通費',
                branch_no2:branch_no2,
                trans_from:trans_from,
                trans_waypoint:trans_waypoint,
                trans_to:trans_to,
                amount:amount,
            }
            response.render('te_newrecord', opt);
    }
    
    //保存ボタンが押されたときに実行
    else if(req.body.save){
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
    let dWay = req.body.trans_type;
    let dStart = req.body.trans_from;
    let dGoal = req.body.trans_to;
    let dWaypoint = req.body.trans_waypoint;
    let dPrice = req.body.amount;
    let dTimes = req.body.count;
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
    const sql = "UPDATE TeDetail SET emp_no=dEmpno, sheet_year=year, sheet_month=tmonth, branch_no=branch_no2, year=dYear, month=dMonth, day=dDay, trans_type=dWay, trans_from=dStart, trans_to=dGoal, trans_waypoint=dWaypoint, amount=dPrice, count=dTimes, job_no=dJobno, job_manager=dJobmanager, claim_flag=dClaimflag, charge_flag=dChargeflag, ref_no=dRefno, status=dStasus, remarks=dMemo, new=dNew, new_date=dNewdate, renew=dNew, renew_date=dNewdate WHERE sheet_month="+"'"+tmonth+"'";
    console.log(sql)
    client.query(sql, function(err, result){
      console.log(result);
      client.end()
    });
    let opt={
      title:'example',
      id:id,
      mail:mail,
    }
    res.render('index',opt);
});

module.exports = router;