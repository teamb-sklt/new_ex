var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){

    let opt = {
        title: '経費新規登録ページ',
        message: '各項目を入力してください',
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


module.exports = router;