const express = require("express");
const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const router = express.Router();

// 회원가입 API
router.post("/signup", async(req, res) => {
    const { nickname, password, confirm } = req.body;
    // 닉네임 정규식
    const nicknameRegex = /^[A-Za-z0-9]{3,}$/;
    // 비밀번호 정규식
    const passwordRegex = /^.{4,}$/;
    // 닉네임 유효성 검사
    if (!nicknameRegex.test(nickname)) {
        return res.status(412).json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
    }
    // 비밀번호 일치 검사
    if (password !== confirm) {
        return res.status(412).json({ errorMessage: "패스워드가 일치하지 않습니다." });
    }
    // 비밀번호 유효성 검사
    if (!passwordRegex.test(password)) {
        return res.status(412).json({ errorMessage: "패스워드의 형식이 일치하지 않습니다." });
    }
    // 비밀번호에 닉네임 포함 검사
    if (password.includes(nickname)) {
        return res.status(412).json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
    }
    // 닉네임 중복 검사
    const isExistUsers = await Users.findOne({
        where: { nickname },
    });
    if (isExistUsers) {
        return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
    }

    try {
        await Users.create({ nickname, password });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
    }

    res.status(201).json({ message: "회원가입에 성공했습니다." });
});

// 로그인 API
router.post("/login", async(req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({
        where: { nickname },
    });

    if (!user || user.password !== password) {
        return res.status(401).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
    }

    try {
    // JWT 생성
    const token = jwt.sign({ userId: user.userId}, "customized-secret-key");
    // 쿠키 생성
    res.cookie("authorization", `Bearer ${token}`);
    // 응답
    res.status(200).json({ message: "로그인에 성공했습니다." });
    } catch (err) {
        console.log(err);
        res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
    }
});

module.exports = router;