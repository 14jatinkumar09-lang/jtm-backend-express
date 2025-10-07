
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
app.use(cors({
  origin: 'https://ja-tm-backend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
/// dependencies

const jwt = require("jsonwebtoken");
const { userZodSchema, updateUserDetailSchema } = require('./zod.js');
const { JWT_KEY } = require("./jwtSecret.js");
const { User, Account } = require('./db.js');
const { checkUserExistence , auth } = require('./middlewares.js')

app.use(cors({
    origin:"*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());


/////// middlewares/.///////



//////



app.post("/signup", checkUserExistence, async (req, res) => {
    const userInfo = req.body;
    const isValidating = userZodSchema.safeParse(userInfo);
    if (!isValidating.success) {
        return res.status(411).json({
            msg: "u have sent wrong inputs"
        })
    }

    const dbUser = await new User(req.body);
    dbUser.save();
    const bankAccount = await new Account({
        userId : userInfo.userId ,
        balance: 1 + Math.random() * 10000
    })
    bankAccount.save();
    res.json({
        msg: "u have successfully signed up use your email to login"
    })
})









//////signin


app.post("/signin", async (req, res) => {
    const body = req.body;
    const signing = await User.findOne({
        userId: body.userId,
        password: body.password
    })
    if (signing) {
        const token = jwt.sign(body.userId, JWT_KEY);
        res.json({
            msg: "signed in successfully",
            token ,
            username : signing.firstName
        })
    }
    else {
        res.status(404).json({
            msg: "no user existed userId/password must be wrong try again"
        })
    }
})






////
app.put("/update/frofile", auth, async (req, res) => {
    const userInfo = req.body;
    const isValidating = updateUserDetailSchema.safeParse(userInfo);
    if (! isValidating.success) {
        res.status(411).json({
            msg: "u have sent wrong inputs"
        })
    }
    await User.updateOne({
        userId: req.userId
    }, {
        password:userInfo.password ,
        lastName:userInfo.lastName ,
        firstName:userInfo.firstName
    })
    res.json({
        msg: "updated successfully"
    })

})

///// searching users 
app.get("/userSearch", async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })
    res.json({
        user: users.map(user => ({
            username: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})





/// finding balance

app.get("/findBalance/", auth, async (req, res) => {
    const userId = req.userId ;
    const account = await Account.findOne({
        userId: userId
    })
    res.json({
        balance: account.balance
    })
})



app.post("/sendMoney", auth, async (req, res) => {
    //session start
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = req.body;

        const account = await Account.findOne({
            userId: req.userId
        }).session(session);

        const toAccount = await Account.findOne({
            userId: transaction.userId
        }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.json({
                msg: "user not found or might deleted thier account"
            })
        }

        if (account.balance < transaction.amount) {
            await session.abortTransaction();
            return res.json({
                msg: "not sufficient balance to support this transaction"
            })
        }

        await Account.updateOne({
            userId: req.userId
        }, {
            $inc: {
                balance: -transaction.amount
            }
        }).session(session);

        await Account.updateOne({
            userId: transaction.userId
        }, {
            $inc: {
                balance: transaction.amount
            }
        }).session(session);

        await session.commitTransaction();

        res.json({
            msg: "transaction succesfull"
        })

    }
    catch (error) {
        res.json({
            msg: "something went wrong "
        })
    }
})

module.exports = app ;
app.listen(3000);
