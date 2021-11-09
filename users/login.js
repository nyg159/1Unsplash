var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
var secretObj = require("../jwt");
require("dotenv").config();

router.use(bodyParser.urlencoded({ extended:false })); 
router.use(bodyParser.json());




const sequelize = new Sequelize('unsplash', 'root', process.env.MYSQL_PASSWORD, {
	host: '127.0.0.1',
	dialect: 'mysql',
	logging: false,
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci',
	},
	pool: {
		max: 5, 	//db 접속자 최대 숫자
		min: 0,
		acquire: 30000,
		idle: 5000,
	},
}); //sequelize 정의

// UserLogin Table 생성 함수 정의
const UserLoginTable = (sequelize, DataTypes) => {
	return sequelize.define('user', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			comment: 'proper id',
		},
		name: {
			type: DataTypes.STRING(40),
			allowNull: false,
			comment: 'name',
		},
		email: {
			type: DataTypes.STRING(40),
			allowNull: false,
			comment: 'user email',
		},
		password: {
			type: DataTypes.STRING(40),
			allowNull: false,
			comment: 'password',
		},
	
	},
	//sequelize table 설정 및 등등
	{
		classMethods: {},
		tablesName: "user",
		freezeTableName: true,
		underscored: true,
		timesettamps: false,
	});
};

// UserLogin Table 생성 함수 정의

const User = UserLoginTable(sequelize, Sequelize.DataTypes);

sequelize
	.sync({ force: true })
	.then(() => {
		console.log(' DB running ');
	})
	.catch((err) => {
		console.log('fail');
		console.log(err);
	});

// db에 사용자 데이터를 넣는다 (회원가입)
router.post('/createusers', async (req, res) => {

	console.log("createuser page open");

	const { email, password, name } = req.body;
	const user = await User.create({
		email, password, name,
	});
	if (user) {
		// 유저 생성이 완료된 경우
		console.log('유저가 생성되었습니다.');
		res.status(201).json(user);
	} else {
		// 유저 생성이 실패한 경우
		console.log('유저 생성에 실패하였습니다.');
		res.status(400).send('유저 생성에 실패하였습니다.');
	}
});

router.post('/check', (req, res) => {

	console.log("login page open");

	// 로그인 되었다고 사용자에게 알려줌
	var reqemail = req.body.email;
	var reqpassword = req.body.password;

	User.findOne({
		where : {
			email : reqemail,
			password : reqpassword
		
		}
	}).then(function(data)
	{
		if( data == null || data == undefined ) {
			console.log("아이디 또는 비밀번호가 잘못 입력 되었습니다.");
			res.status(412) ;
			var data = { success: false, msg: '아이디 또는 비밀번호가 잘못 입력 되었습니다.'};

			res.json(data);
			
		}else{
				let token = jwt.sign({
					email: reqemail,    //토큰내용
					password: reqpassword 
				},
				secretObj.secret, //비밀키
				{
					expiresIn: '5m' //유지 시간
				})
					res.cookie("User", token);
					console.log("로그인 성공 email: " + reqemail);
					var data = {success:true, msg: ' 로그인 되었습니다. '};
					res.status(200).json({
						data,
						token: token
					}); 
			}
	})
		
		
});

router.post('/userdelete/:email', (req, res) => {
	//email 과 일치하는 row를 삭제 할것
	var reqemail = req.body.email;

	User.findOne({
		where : {
			email : reqemail,
		}

	}).then(function(data)
	{
		if( data == null || data == undefined ) {
			console.log("이메일이 존재하지 않습니다. email : "+ reqemail );
			res.status(412) ;
			var data = { success: false, msg: '이메일이 존재 하지 않습니다.'};

			res.json(data);
			
		}else{
				console.log("유저 삭제 완료 email: " + reqemail);
				res.status(200);

				User.destroy({where : {email : reqemail }})
				.then(result => {
					res.json({});
				 }).catch(err => {
					console.error(err);
				 });

				
			}
	})
});

router.get('/check', function(req, res){
	res.sendFile(__dirname + "/loginpage.html");
	console.log('login page opening!');
});

module.exports = router