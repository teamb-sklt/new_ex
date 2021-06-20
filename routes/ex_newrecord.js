const { response } = require('express');
var express = require('express');
var router = express.Router();
const fetch = require('node-fetch');
var { Client, Client } = require('pg');
require('dotenv').config();
const user=process.env.USER;
const dbpassword=process.env.PASSWORD;

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
    // console.log(client)
    // client.query('SELECT * from memo', function(err, result){
    //   if (err){
    //     console.log(err)
    //   }
    //   console.log(result)
    // })
    client.query('SELECT * from exdetail',function(err,result){
      console.log(result)
      for(var i of result.rows){
        console.log(i)
        // id[i]=result.rows[i].id;
        // name[i]=result.rows[i].name;
        // mail[i]=result.rows[i].mail;
        // console.log(id[i]+name[i]+mail[i]);              
      }
      client.end()
    });
    let opt={
        title: '（経費）新規登録ページ',
        message: '各項目を入力してください',
        price: '',
        date:'',
        sStart: '',
        sWaypoint: '',
        sGoal: '',
    }
    res.render('ex_newrecord',opt);
  });

/*
router.post('/',function(req,response,next){
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
    client.query('SELECT * from exdetail',function(err,result){
        console.log(result)
        for(var i of result.rows){
            console.log(i)
      // id[i]=result.rows[i].id;
      // name[i]=result.rows[i].name;
      // mail[i]=result.rows[i].mail;
      // console.log(id[i]+name[i]+mail[i]);              
    }
    client.end()
    });
        let opt={
        title:'example',
        id:id,
        name:name,
        mail:mail,
    }
        
        //フォームに入力された値を定義
        let dDate = req.body.date;
        let dStart = req.body.routeStart;
        let dGoal = req.body.routeGoal;
        let dWaypoint = req.body.routeWaypoint;
        let dWay = req.body.way;
        let dPrice =target.Oneway;
        let dTimes = req.body.times;
        let dMemo = req.body.memo;
        let dPattern = req.body.regularly;
        let dShinsei =1;
        let dMovedate = req.body.date;
        let dUpdate =req.body.date;

        //インサートコマンドを定義
        const sql = "INSERT INTO kotsuhi_memo (memo_no, user_no,Memo_YMD,Shuppatsu_Nm,Totyaku_Nm,Keiyu_Nm,Shudan_Nm,Memo_Kingaku,Times,Job_Memo,Ptn_Toroku_flg,Shinsei_flg,Biko_Memo,Koshin_Date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)";
        const values = [4, 4, dDate, dStart, dGoal, dWaypoint, dWay, dPrice, dTimes, dMemo, dPattern, dShinsei, dMovedate, dUpdate];

        //PostgreSQLのクエリ実行
        client.query(sql, values)
            .then(res => {
                console.log(res)
                client.end()
            })
            .catch(e => console.error(e.stack));

        //renderする際のオプションを定義
        let opt = {
            title: '保存できました！',
            message: '続けて検索する場合はそのまま各項目を入力してください',
            price: 'placeholder="自動計算（ICカード利用時料金）"',
            moveDate:'placeholder="移動した日付・時刻が自動で追加されます"',
            date:'',
            sStart: '',
            sWaypoint: '',
            sGoal: '',
        };
        response.render('ex_detail', opt);
    }
        amount: '',
        moveDate:'',
        moveDate2: "移動した日付・時刻が自動で追加されます",
        year:'',
        month:'',
        day:'',
        code_name: '',
        summary: '',
        payee: '',
        id:'',
        flg:''
    };
    res.render('ex_newrecord', opt);
});

    //削除ボタンが押された時に実行
    else if(req.body.delete){

        //PostgreSQLに接続
        var client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'ex_support',
            password:'dbpassword',
            port:5432
        });
    
        client.connect();   //これは必ず必要

        //ディレートコマンドを定義
        const sql = "DELETE FROM kotsuhi_memo WHERE user_no = 4"    //削除条件をWHERE以降で指定

        //PostgreSQLのクエリ実行
        client.query(sql)
        .then(res => {
            console.log(res)
            client.end()
        })
        .catch(e => console.error(e.stack));

        //renderする際のオプションを定義
        let opt = {
            title: '削除できました！',
            message: '続けて検索する場合はそのまま各項目を入力してください',
            price: 'placeholder="自動計算（ICカード利用時料金）"',
            moveDate:'placeholder="移動した日付・時刻が自動で追加されます"',
            date:'',
            sStart: '',
            sWaypoint: '',
            sGoal: ''
        };

        response.render('ex_detail', opt);
    }
});
*/

module.exports = router;