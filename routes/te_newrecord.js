var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){

    let opt = {
        title: '経費新規登録ページ',
        message: '各項目を入力してください',
        amount: 'placeholder="自動計算（ICカード利用時料金）"',
        moveDate:'',
        moveDate2: "移動した日付・時刻が自動で追加されます",
        year:'',
        month:'',
        day:'',
        trans_from: '',
        trans_waypoint: '',
        trans_to: '',
        id:'',
        flg:''
    };
    res.render('te_newrecord', opt);
});


module.exports = router;