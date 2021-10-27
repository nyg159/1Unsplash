var express = require('express');
var router = express.Router();

// 메인페이지
router.get('/', (req, res) => {
	res.send('mainpage');
    console.log('main page open');
});

module.exports = router;