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
    // console.log(client)
    // client.query('SELECT * from example', function(err, result){
    //   if (err){
    //     console.log(err) //show error infomation
    //   }
    //   console.log(result)
    // })
    client.query("SELECT count(*) from TeDetail WHERE sheet_month="+"'"+tmonth+"'" ,function(err,result){
    //   console.log(result)
    //   console.log(result.rows[0].count)
    branch_no=result.rows[0].count
      branch_no1=Number(branch_no);
      branch_no2=branch_no1+1
      console.log(branch_no2)

      client.end()
    });
  let opt={
    title: '交通費',
    tmonth:tmonth,
    lmonth:lmonth,
    branch_no2:branch_no2,
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
     res.render('te_newrecord', opt);
    });



router.post('/',async function(req,response,next){

    //検索ボタンが押されたら実行
    
    
    //保存ボタンが押されたときに実行
    if(req.body.save){
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
    // console.log(client)
    // client.query('SELECT * from memo', function(err, result){
    //   if (err){
    //     console.log(err)
    //   }
    //   console.log(result)
    // })
    
    //フォームに入力された値を定義
    let dEmpno = 001; //ログインID=社員IDに変更要
    let dYear = req.body.year;
    let dMonth = req.body.month;
    let dDay = req.body.day;
    let dStart = req.body.routeStart;
    let dGoal = req.body.routeGoal;
    let dWaypoint = req.body.routeWaypoint;
    let dWay = req.body.way;
    let dPrice =target.Oneway;
    let dTimes = req.body.times;
    let dJobno = req.body.job_no;
    let dJobmanager = 111; //仮で111
    let dClaimflag = req.body.claim_flag;
    let dChargeflag = req.body.charge_flag;
    let dRefno = req.body.ref_no;
    let dStasus = 11; //JM申請中ステータス
    let dMemo = req.body.memo;
    let dNew = 001; //ログインID=社員IDに変更要
    let dNewdate = req.body.year+req.body.month+req.body.day;

    //インサートコマンドを定義
    const sql = "INSERT INTO tedetail (emp_no, sheet_year, sheet_month, branch_no, year, month, day, trans_type, trans_from, trans_to, trans_waypoint, amount, count, job_no, job_manager, claim_flag, charge_flag, ref_no, status, remarks, new, new_date, renew, renew_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)";
    const values = [dEmpno,dYear,dMonth,dDay, ,dYear,dMonth,dDay,dWay,dStart,dGoal,dWaypoint,dPrice,dTimes,dJobno,dJobmanager,dClaimflag,dChargeflag,dRefno,dStasus,dMemo,dNew,dNewdate, , ];
    client.query(sql, values)
    .then(res => {
        console.log(res)
        client.end()
    })
    .catch(e => console.error(e.stack));
    let opt={
        title: '保存できました！',
        message: '続けて検索する場合はそのまま各項目を入力してください',
        price: 'placeholder="自動計算（ICカード利用時料金）"',
        moveDate:'placeholder="移動した日付・時刻が自動で追加されます"',
        branch_no2:branch_no2,
        date:'',
        sStart: '',
        sWaypoint: '',
        sGoal: '',
    }
    response.render('te_newrecord',opt);
    }
    //削除ボタンが押された時に実行
    // else if(req.body.delete){
    //     const client = (process.env.ENVIRONMENT == "LIVE") ? new Client({
    //       connectionString: process.env.DATABASE_URL,
    //       ssl: {
    //           rejectUnauthorized: false
    //       }
    //     }) : new Client({
    //       user: 'postgres',
    //       host: 'localhost',
    //       database: 'itpjph3',
    //       password: dbpassword,
    //       port: 5432
    //     })
    //     await client.connect()
    //     // console.log(client)
    //     // client.query('SELECT * from memo', function(err, result){
    //     //   if (err){
    //     //     console.log(err)
    //     //   }
    //     //   console.log(result)
    //     // })

    //         //フォームに入力された値を定義
    //         let dDate = req.body.date;
    //         let dStart = req.body.routeStart;
    //         let dGoal = req.body.routeGoal;
    //         let dWaypoint = req.body.routeWaypoint;
    //         let dWay = req.body.way;
    //         let dPrice =target.Oneway;
    //         let dTimes = req.body.times;
    //         let dMemo = req.body.memo;
    //         let dPattern = req.body.regularly;
    //         let dShinsei =1;
    //         let dMovedate = req.body.date;
    //         let dUpdate =req.body.date;

    // client.query('SELECT * from tedetail',function(err,result){
    //   console.log(result)
    //   for(var i of result.rows){
    //     console.log(i)
    //     // id[i]=result.rows[i].id;
    //     // name[i]=result.rows[i].name;
    //     // mail[i]=result.rows[i].mail;
    //     // console.log(id[i]+name[i]+mail[i]);              
    //   }
    // client.end()
    // });
    //     //renderする際のオプションを定義
    //     let opt = {
    //         title: '削除できました！',
    //         message: '続けて検索する場合はそのまま各項目を入力してください',
    //         price: 'placeholder="自動計算（ICカード利用時料金）"',
    //         moveDate:'placeholder="移動した日付・時刻が自動で追加されます"',
    //         date:'',
    //         sStart: '',
    //         sWaypoint: '',
    //         sGoal: ''
    //     };
    //     response.render('te_newrecord', opt);
    // };
});

module.exports = router;
