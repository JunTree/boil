const express = require('express')
const app = express()
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const {User} = require('./models/User');
//const {auth} = require('./middleware/auth');


app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());


const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
} ).then(() => console.log('MongoDB Connected...'))
   .catch(err => console.log(err))


app.get('/', (req, res) => { res.send('Hello World! 하이!') })


app.post('/api/users/register', (req, res)=>{
    //회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 데이터 베이스에 넣어준다.

    const user = new User(req.body)

    user.save((err,userInfo) => {
        if(err) return res.json({ success: false, err})
            return res.status(200).json({
                success: true
        })
    })
}) 

app.post('/api/users/login', (req, res)=>{

    //요청된 이메일을 데이터베이스에서 찾기 
    User.findOne({ email: req.body.email}, (err,user)=>{
        if(!user){
            return res.json({
                loginSuccess: false,
                message:"해당하는 유저가 없습니다."
            })
        }

    //이메일이 있다면 비밀번호가 같은지 확인
        user.comparePassword(req.body.password , (err, isMatch)=>{
            if(!isMatch)
                return res.json({ 
                    loginSuccess: false,
                     message:"비밀번호가 틀렸습니다"})

    //비밀번호가 같다면 토큰을 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);
            
            // 토큰을 저장한다.
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id})


            })
        })
    })
})



const port = 5000

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
