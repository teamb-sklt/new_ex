const { response } = require('express');
var express = require('express');
var router = express.Router();
var moment = require("moment");
require('dotenv').config();
const user=process.env.USER;
const dbpassword=process.env.PASSWORD;
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

//各登録済み項目反映&DB接続
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
  }
    // else if(req.body.save){
    // // 保存ボタンが押されたときに実行
    //     //PostgreSQLに接続
    //     var client = new Client({
    //         user: 'postgres',
    //         host: 'localhost',
    //         database: 'ex_support',
    //         password: dbpassword,
    //         port:5432
    //     });

    //     client.connect();   //これは必ず必要
        
    //     //フォームに入力された値を定義
    //     let dDate = req.body.date;
    //     let dStart = req.body.routeStart;
    //     let dGoal = req.body.routeGoal;
    //     let dWaypoint = req.body.routeWaypoint;
    //     let dWay = req.body.way;
    //     let dPrice =target.Oneway;
    //     let dTimes = req.body.times;
    //     let dMemo = req.body.memo;
    //     let dPattern = req.body.regularly;
    //     let dShinsei =1;
    //     let dMovedate = req.body.date;
    //     let dUpdate =req.body.date;

    //     //インサートコマンドを定義
    //     const sql = "INSERT INTO kotsuhi_memo (memo_no, user_no,Memo_YMD,Shuppatsu_Nm,Totyaku_Nm,Keiyu_Nm,Shudan_Nm,Memo_Kingaku,Times,Job_Memo,Ptn_Toroku_flg,Shinsei_flg,Biko_Memo,Koshin_Date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)";
    //     const values = [4, 4, dDate, dStart, dGoal, dWaypoint, dWay, dPrice, dTimes, dMemo, dPattern, dShinsei, dMovedate, dUpdate];

    //     //PostgreSQLのクエリ実行
    //     client.query(sql, values)
    //         .then(res => {
    //             console.log(res)
    //             client.end()
    //         })
    //         .catch(e => console.error(e.stack));

    //     //renderする際のオプションを定義
    //     let opt = {
    //         title: '保存できました！',
    //         message: '続けて検索する場合はそのまま各項目を入力してください',
    //         price: 'placeholder="自動計算（ICカード利用時料金）"',
    //         moveDate:'placeholder="移動した日付・時刻が自動で追加されます"',
    //         date:'',
    //         sStart: '',
    //         sWaypoint: '',
    //         sGoal: '',
    //     };
    //     response.render('te_detail', opt);
    
    // }else if(req.body.delete){
    // //削除ボタンが押された時に実行
    //     //PostgreSQLに接続
    //     var client = new Client({
    //         user: 'postgres',
    //         host: 'localhost',
    //         database: 'ex_support',
    //         password: dbpassword,
    //         port:5432
    //     });
    
    //     client.connect();   //これは必ず必要

    //     //ディレートコマンドを定義
    //     const sql = "DELETE FROM kotsuhi_memo WHERE user_no = 4"    //削除条件をWHERE以降で指定

    //     //PostgreSQLのクエリ実行
    //     client.query(sql)
    //     .then(res => {
    //         console.log(res)
    //         client.end()
    //     })
    //     .catch(e => console.error(e.stack));

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

    //     response.render('te_detail', opt);
    // }
})  

module.exports = router;