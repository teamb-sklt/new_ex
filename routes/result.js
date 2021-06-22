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

router.get('/',function(req,response,next){
    // let trans_from = req.body.trans_from;
    // let trans_waypoint = req.body.trans_waypoint;
    // let trans_to = req.body.trans_to;
    // let branch_no2 = req.body.branch_no2;
    // let amount = req.body.amount;
    let opt={
        title: '交通費',
        branch_no2:'',
        trans_to:'',
        trans_waypoint:'',
        trans_from:'',
        amount:'',
        result:'',
        result1:'',
        result2:'',
        // branch_no2:req.body.branch_no2,
        // trans_from:req.body.trans_from,
        // trans_waypoint:req.body.trans_waypoint,
        // trans_to:req.body.trans_to,
        // amount:req.body.amount,
    }
    response.render('result', opt);
})

//検索ボタンが押されたら実行
router.post('/',function(req,response,next){

    //各種API・パラメータの定義
    let baseUrl = 'https://api.ekispert.jp/v1/json/';   //すべてのベースURL
    let seachUrl = 'search/course/extreme?';//単価調べる用の部品URL
    let codeURl = 'station?';   //駅名を駅コードに変換する用の部品URL
    let accessKey = 'key=test_VtL3kuyWkrB'; //アクセスキーの定義  
    let ic = 'toolbox/course/condition?ticketSystemType=ic&' //ICカード検索の条件を生成

    //フォームの入力内容を定義
    let stationStart = req.body.trans_from;
    let stationWaypoint = req.body.trans_waypoint;
    let stationGoal = req.body.trans_to;
    let branch_no2 = req.body.branch_no;
    console.log(branch_no2)
    let codeStart;
    let codeWaypoint;
    let codeGoal;

    //ICカード条件生成のための完成URL（エンコード済み）
    let icUrl = encodeURI(`${baseUrl}${ic}${accessKey}`) 

    //ICカードの条件を生成するAPI
    function icCard(){
        return fetch(icUrl)
        .then(res =>res.text()) //データをテキストに変換
        .then(res => JSON.parse(res))   //json形式のテキストをオブジェクトに変換する
        .then(res =>{return icData = '&conditionDetail='+res.ResultSet.Condition;})
        .catch(err =>{console.log('失敗')});
    }
    

    //駅コード取得のための完成URL（エンコード済み）
    let searchCodeStart = encodeURI(baseUrl+codeURl+accessKey+'&name='+stationStart);
    let searchCodeWaypoint = encodeURI(baseUrl+codeURl+accessKey+'&name='+stationWaypoint) ;
    let searchCodeGoal = encodeURI(baseUrl+codeURl+accessKey+'&name='+stationGoal) ;
    // console.log(searchCodeStart)

    //出発地の駅コードを取得するためのAPI
    function searchCode1(){
        return fetch(searchCodeStart)
        .then(res =>res.text())
        .then(res => JSON.parse(res))
        .then(res1 =>{return codeStart = res1.ResultSet.Point[0].Station.code;})
        .catch(err =>{console.log('失敗1')});
    }
    // console.log(searchCode1(codeStart))
    
    //経由地の駅コードを取得するためのAPI
    function searchCode2(){
        return fetch(searchCodeWaypoint)
        .then(res =>res.text())
        .then(res =>JSON.parse(res))
        .then(res2 =>{return  codeWaypoint = res2.ResultSet.Point[0].Station.code;})
        .catch(err =>{console.log('経由地未入力')});
    }

    //目的地の駅コードを取得するためのAPI
    function searchCode3(){
        return fetch(searchCodeGoal)
        .then(res =>res.text())
        .then(res => JSON.parse(res))
        .then(res3 =>{return codeGoal = res3.ResultSet.Point[0].Station.code;})
        .catch(err =>{console.log('失敗3')});
    }
    

    //単価を検索するためのAPI
    function searchPrice(){

        //日付・時刻検索の条件を生成
        let dateUrl = '&date='+req.body.date;
        let timeUrl = '&time='+req.body.time;

        //経由地が未入力の際の条件分岐
        if(codeWaypoint !='undefined'){
            var stationPrice ='&viaList=' +codeStart +':' +codeGoal ;   //取得した駅コードを単価検索用に連結
        }else{ var stationPrice ='&viaList=' +codeStart +':' +codeWaypoint +':' +codeGoal}; //取得した駅コードを単価検索用に連結
        //単価検索用の完成URL
        // let searchPrice = encodeURI(`${baseUrl}${seachUrl}${accessKey}${stationPrice}${dateUrl}${timeUrl}${icData}`);
        let searchPrice = encodeURI(`${baseUrl}${seachUrl}${accessKey}${stationPrice}${icData}`);
        console.log(icData)
        console.log(searchPrice);

        //APIの呼び出しをして、返り値をdetail.ejsにrender
        fetch(searchPrice)
        .then(res =>res.text()) //データをテキストに変換
        .then(res => JSON.parse(res))   //json形式のテキストをオブジェクトに変換する
        .then(res =>{
            let result = []　//これは簡略化されたルートをいれていく配列　例）result[1]とresult[1]がインデックスを連携させている。
            let result1 = [] //これは正しい単価を入れていく配列
            let result2 = [] //これは経由駅を自動でいれていく配列　乗り換えがない場合は到着駅が取られる。　
            for (n of res.ResultSet.Course){
                try {
                    let displayRoute = n.Teiki.DisplayRoute 
                    result.push(displayRoute)
                    let station1 = n.Route.Point[1].Station.Name
                    result2.push(station1)        
                    for( i of n.Price){
                        if(i.kind == 'FareSummary'){
                            let onewayPrice = i.Oneway
                            result1.push(onewayPrice)
                            break
                        }                    
                    }
                }catch(e) {
                    console.log(e)
                  }
                }
                // console.log(result2[2])


            //renderする際のオプションを定義
            let opt = {
                branch_no2:branch_no2,
                // title: '運賃が計算できました！',
                // message: '続けて各項目を記入し、保存してください',
                result:result,
                result1:result1,
                result2:result2,
                trans_from:stationStart,
                trans_waypoint:stationWaypoint,
                trans_to:stationGoal,
            };

            //renderする
            response.render('result',opt); //経路選択画面に遷移させる
        })
        .catch(err =>{

            //renderする際のオプションを定義
            let opt = {
                branch_no2:branch_no2,
                title: "運賃が計算できませんでした。日付・時刻は半角数字、駅名は正しい名前を入力してください",
                amount: 'placeholder="自動計算（ICカード利用時料金）"',
                trans_from: req.body.stationStart,
                trans_waypoint: req.body.stationWaypoint,
                trans_to: req.body.stationGoal,
            };

            //renderする
            response.render('te_newrecord',opt);
        });
    }
        
    //すべてのAPI関数を呼び出して関数に定義（非同期を同期のように処理）
    async function chijiiwa(){
        await searchCode1();
        await searchCode2();
        await searchCode3();
        await icCard();
        
        searchPrice();
    }
    

    //関数の呼び出し
    chijiiwa();
    
});

// //経路選択画面からPOSTで引っ張ってくる
// router.post('/',function(req,response,next){
//     // let trans_from = req.body.trans_from;
//     // let trans_waypoint = req.body.trans_waypoint;
//     // let trans_to = req.body.trans_to;
//     // let branch_no2 = req.body.branch_no2;
//     // let amount = req.body.amount;
//     let opt={
//         title: '交通費',
//         branch_no2:req.body.branch_no2,
//         trans_from:req.body.trans_from,
//         trans_waypoint:req.body.trans_waypoint,
//         trans_to:req.body.trans_to,
//         amount:req.body.amount,
//     }
//     response.render('te_newrecord', opt);
// })
module.exports = router;