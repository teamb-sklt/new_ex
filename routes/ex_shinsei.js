const { response } = require('express');
var express = require('express');
var router = express.Router();
const moment = require("moment");
require('dotenv').config();
var nodemailer = require("nodemailer");



var { Client, Client } = require('pg');  //データベースを使うための宣言
const dbpassword = process.env.PASSWORD //DBを使うのに必要
const user=process.env.USER;
const apiKey = process.env.APIKEY //APIkeyを使うのに必要

var today = moment();
var year = moment().format("YYYY");
var tomonth = moment().format("MM");
// var nm = moment().add(1,'month').format("MM");　//翌月
// var lm = moment().add(-1,'month',).format("MM");　//先月
var date = moment().format("DD")
var tmonth;
var lmonth;
var lastday;
var job_manager_no=[];
var job_manager_emp_mail;
var sql1;

if(date>20){
  tmonth=moment().add(1,'month').format("MM");
  lmonth=tomonth;
}else{
  tmonth=tomonth;
  lmonth=moment().add(-1,'month',).format("MM");
  lastday = 20 - date;
}



router.post('/', async function(req, res, next) {
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

    function mailadress(emailadress){
      var receiverEmailAddress; //ここは自分のメールアドレスにしてください。じゃないと僕に大量にメールが届くので・・・
      var senderEmailAddress = 'test.itpj@gmail.com' //テスト用のアカウント（変更しないでください）
      var senderEmailPassword = 'ogrsnpgudnugutav'　//テスト用のアカウントのアプリPW（変更しないでください）
      //SMTPサーバの基本情報設定
      var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
      user: senderEmailAddress,
      pass: senderEmailPassword
      }
      });
  
      //メール情報の作成
      var mailOptions1 = {
      from: senderEmailAddress,
      // to: receiverEmailAddress,
      to: emailadress,
      subject: 'JM申請のお知らせ',　//件名
      text: 'ジョブメンバーよりJM申請が行われました'　//本文
      };
  
      　//メール情報の作成
      transporter.sendMail(mailOptions1, function (error, info) {
      if (error) {
      console.log('失敗');
      console.log(mailOptions1);
      } else {
      console.log('成功');
      console.log(mailOptions1);
      }
      });
    }

  // let emp_no = req.body.emp_no
  //const query = "select emp_mail from employee inner join tedetail on employee.emp_no = tedetail.job_manager where tedetail.sheet_month='"+tmonth+"' and tedetail.status='00' ; UPDATE TeDetail SET status='11' WHERE status='00' AND sheet_month="+ "'" + tmonth +"'" ;
  //const query = "UPDATE TeDetail SET status='11' WHERE status='00' AND sheet_month="+ "'" + tmonth +"' ; select emp_mail from employee inner join tedetail on employee.emp_no = tedetail.job_manager where tedetail.sheet_month='"+tmonth+"' and tedetail.status='00'" 

  function mailokuru(){
  client.query("select emp_mail from employee inner join exdetail on employee.emp_no = exdetail.job_manager where exdetail.sheet_month='"+tmonth+"' and exdetail.status='00'" ,function(err,result){
    if(err){
      console.log(err)
    }
    // console.log(query)
    // console.log(result[0].command)
    console.log(result.rows)
    // emailadress = result.rows
    // console.log(emailadress)
    // console.log(result.rows)
    
    for(n of result.rows){
      let emailadress = n.emp_mail
      mailadress(emailadress)
      console.log(emailadress)

    }
  })
}
 function update(){
  client.query("UPDATE ExDetail SET status='11' WHERE status='00' AND sheet_month="+ "'" + tmonth +"'",function(err,result){
    if(err){
      console.log(err)
    }
    // console.log(query)
    console.log(result.command)
    // emailadress = result.rows
    // console.log(emailadress)
    // console.log(result.rows)
  client.end()
  res.redirect("/ex_thismonth");
  })
 }

      
  // function job_manager(){
  //     return client
  //       .query("SELECT job_manager from TeDetail WHERE sheet_month='"+tmonth+"'"+ "AND status='00'")
  //       // .then(res => console.log(res.rows))
  //       .then(res =>{ 
  //         for(i in res.rows){
  //           job_manager_no.push(res.rows[i].job_manager)}
  //         })
  //       .then(res =>{return job_manager_no})
  //       .then (res1 => console.log(job_manager_no))
  //       .catch(e => console.error(e.stack))
  // }
  
  // function kueribun(){
  //   var sql1 = job_manager_no.join("' OR emp_no='",'')
  //   console.log(sql1)
  //   return;
  // }

  // function emp_mail(){
  //   console.log(sql1)
  //     return client
  //       .query("SELECT emp_mail from Employee WHERE emp_no='"+sql1+"'")
  //       .then(res => console.log(res))
  //       // .then(res =>{receiverEmailAddress.push(res.rows[0].emp_mail);})
  //       // .then(res =>{return receiverEmailAddress = res.rows[0].emp_mail;})
  //       // .then(res =>console.log(receiverEmailAddress))
  //       .catch(e => console.error(e.stack))
  // }
  // // console.log(receiverEmailAddress)




    async function inoue(){
      await mailokuru();

      update();
      // shinsei();
      // sendMail();
    }
    //関数の呼び出し
    inoue();



    
  })
module.exports = router;


// const { response } = require('express');
// var express = require('express');
// var router = express.Router();
// const moment = require("moment");
// require('dotenv').config();

// var { Client, Client } = require('pg');  //データベースを使うための宣言
// const dbpassword = process.env.PASSWORD //DBを使うのに必要
// const user=process.env.USER;
// const apiKey = process.env.APIKEY //APIkeyを使うのに必要

// var today = moment();
// var year = moment().format("YYYY");
// var tomonth = moment().format("MM");
// // var nm = moment().add(1,'month').format("MM");　//翌月
// // var lm = moment().add(-1,'month',).format("MM");　//先月
// var date = moment().format("DD")
// var tmonth;
// var lmonth;
// var lastday;

// if(date>20){
//   tmonth=moment().add(1,'month').format("MM");
//   lmonth=tomonth;
// }else{
//   tmonth=tomonth;
//   lmonth=moment().add(-1,'month',).format("MM");
//   lastday = 20 - date;
// }

// router.post('/', async function(req, res, next) {
//     const client = (process.env.ENVIRONMENT == "LIVE") ? new Client({
//       connectionString: process.env.DATABASE_URL,
//       ssl: {
//           rejectUnauthorized: false
//       }
//     }) : new Client({
//       user: user,
//       host: 'localhost',
//       database: 'itpjph3',
//       password: dbpassword,
//       port: 5432
//     })
//     await client.connect()

//     // let emp_no = req.body.emp_no
//     function job_manager(){
//       return client
//         .query("SELECT job_manager from ExDetail WHERE sheet_month='"+tmonth+"'"+ "AND status='00'")
//         .then(res =>{return job_manager_no = res.rows[0].job_manager;})
//         .then (res1 => console.log(job_manager_no))
//         .catch(e => console.error(e.stack))
//   }
  

//   function emp_mail(){
//       return client
//         .query("SELECT emp_mail from Employee WHERE emp_no='"+job_manager_no +"'")
//         .then(res =>{return job_manager_emp_mail = res.rows[0].emp_mail;})
//         .then(res =>console.log(job_manager_emp_mail))
//         // .catch(e => console.error(e.stack))
//   }

//   function shinsei(){
//     client
//       .query("UPDATE ExDetail SET status='11' WHERE emp_no='001' AND status='00' AND sheet_month="+ "'" + tmonth +"'" )
//       .then(res => res)
//       .then(res.redirect("/ex_thismonth"))
//       .catch(e => console.error(e.stack))
//       // client.end()
//   }

//     async function inoue(){
//       await job_manager();

//       emp_mail();
//       shinsei();
//     }
//     //関数の呼び出し
//     inoue();
// })
// module.exports = router;