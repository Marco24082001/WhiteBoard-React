const { Users } = require("../models");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { sign } = require("jsonwebtoken");
const {Op, Model} = require("sequelize");

const transporter = nodemailer.createTransport(sendgridTransport({
        auth:{
        api_key: process.env.API_MAIL_KEY
        }
    })
);

module.exports.signup = async function(req, res) {
    const { username, password, email, photo } = req.body;
    const _user = await Users.findOne({ where: { email: email } });
    if(_user) return res.json({ error: "Email has existed" });
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username: username,
            password: hash,
            email: email,
            photo: photo
        }).then((user) => {
            const accessToken = sign(
                { username: user.username, id: user.id },
                    process.env.KEY_SIGN
                );
            res.json(accessToken);
        });
        transporter.sendMail({
            to: email,
            from:"thiendia.dn113@gmail.com",
            subject:"signup success",
            html:"<h1>welcom to TingTy</h1>"
        })
  });

  
};

module.exports.login = async function(req, res) {
    const { email, password } = req.body;

    const user = await Users.findOne({ where: { email: email } });

    if (!user) return res.json({ error: "User Doesn't Exist" });

    bcrypt.compare(password, user.password).then(async (match) => {
        if (!match) res.json({ error: "Wrong Username And Password Combination" });

        const accessToken = sign(
        { username: user.username, id: user.id },
        "importantsecret"
        );
        return res.json(accessToken);
    });
};

module.exports.auth = async function(req, res) {
    Users.findOne({ 
        where: {
          id: req.user.id
        }
    })
    .then((user) => {
        if(user){
            res.json(user);
        }else {
            res.json({error: "User isn't existed!"});
        }
    })
    .catch((err) => {
        console.log(err); res.json({error: err})
    });
};

module.exports.getPhoto = async function(req, res) {
    Users.findOne({
        where: {
          id: req.user.id
        },
        attributes: ['photo'],
    })
    .then((photo) => res.json(photo))
    .catch((err) => res.json({error: 'fail'}));
};

module.exports.resetPassword = async function(req, res) {
    crypto.randomBytes(32, async (err, buffer) => {
        if(err) {
          console.log(err);
        }
        
        const token = buffer.toString("hex");
        const user = await Users.findOne({ where:{email:req.body.email} });
        if(!user) return res.status(422).json({error:"User Doesn't Exist with this email"});
        user.resetToken = token;
        user.expireToken = Date.now() + 360000;
        await user.save();
        transporter.sendMail({
          to: user.email,
          from: "thiendia.dn113@gmail.com",
          subject: "password reset",
          html: `
            <p>You requested for password reset</p>
            <h2>click in this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h2>
          `
        })
        res.json({message:"check your email"});
    })
};

module.exports.newPassword = async function(req, res) {
    const newPassword = req.body.password;
    const sentToken = req.body.token;
    const user = await Users.findOne({resetToken: sentToken, expireToken:{[Op.gt]: Date.now()}});
    if(!user) return res.status(422).json({error: "Try again session expired"});
    bcrypt.hash(newPassword, 10).then((hash) => {
        user.password = hash;
        user.resetToken = null;
        user.expireToken = null;
        user.save();
        const accessToken = sign(
        { username: user.username, id: user.id },
        "importantsecret"
        );
        res.json(accessToken);
    }).catch(err => {
        console.log(err);
    });
};

module.exports.settingInfo = async function(req, res) {
    const {username, photo} = req.body;
    await Users.update(
        {
            username: username,
            photo: photo,
        },
        {
            where: {id: req.user.id}
        }
    )
    const accessToken = sign(
        { username: username, id: req.user.id },
        "importantsecret"
    );
    return res.json(accessToken);
};