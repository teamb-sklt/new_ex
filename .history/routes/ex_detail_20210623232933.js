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

    client.query("SELECT count(*) from ExDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
      branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      console.log(branch_no1)

      client.end()
    });
  let opt={
    title: '経費詳細変更',
    year:year,
    month:month,
    day:day,
    branch_no:branch_no1,
    // trans_from:trans_from,
    // trans_waypoint:trans_waypoint,
    // trans_to:trans_to,
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
     res.render('ex_detail', opt);
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

    client.query("SELECT * FROM TeDetail WHERE branch_no='"+branch_no2 +"'" +"AND sheet_month='"+tmonth+"'" ,function(err,result){
      if(err){
        console.log('error')
      }else{
      // console.log(result)
      branch_no2=result.rows[0].branch_no
      trans_from=result.rows[0].trans_from;
      trans_to=result.rows[0].trans_to;
      trans_waypoint=result.rows[0].trans_waypoint;
      trans_type=result.rows[0].trans_type;
      year=result.rows[0].year;
      month=result.rows[0].month;
      day=result.rows[0].day;
      amount=result.rows[0].month;
      count=result.rows[0].count;
      job_no=result.rows[0].job_no;
      job_manager=result.rows[0].job_manager;
      claim_flag=result.rows[0].claim_flag;
      charge_flag=result.rows[0].charge_flag;
      ref_no=result.rows[0].ref_no;
      remarks=result.rows[0].remarks
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
    const sql = "INSERT INTO tedetail (emp_no, sheet_year, sheet_month, branch_no, year, month, day, trans_type, trans_from, trans_to, trans_waypoint, amount, count, job_no, job_manager, claim_flag, charge_flag, ref_no, status, remarks, new, new_date, renew, renew_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)";
    //const values = ["'"+dEmpno+"'","'"+year+"'","'"+tmonth+"'","'"+branch_no2+"'","'"+dYear+"'","'"+dMonth+"'","'"+dDay+"'","'"+dWay+"'","'"+dStart+"'","'"+dGoal+"'","'"+dWaypoint+"'","'"+dPrice+"'","'"+dTimes+"'","'"+dJobno+"'","'"+dJobmanager+"'","'"+dClaimflag+"'","'"+dChargeflag+"'","'"+dRefno+"'","'"+dStasus+"'","'"+dMemo+"'","'"+dNew+"'","'"+dNewdate+"'","'"+dNew+"'","'"+dNewdate+"'"];
    const values = [dEmpno,year,tmonth,branch_no2,dYear,dMonth,dDay,dWay,dStart,dGoal,dWaypoint,dPrice,dTimes,dJobno,dJobmanager,dClaimflag,dChargeflag,dRefno,dStasus,dMemo,dNew,dNewdate,dNew,dNewdate];
    console.log(values)
    client.query(sql, values)
    .then(res => {
        console.log(res)
        client.end()
    })
    .catch(e => console.error(e.stack));
    response.redirect("/te_thismonth");
  }
});

module.exports = router;