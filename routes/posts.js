const express = require('express');
const { Op } = require('sequelize');
const { Posts } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 게시글 생성 API
router.post('/posts', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 데이터가 정상적으로 전달되지 않는 경우
  if (!title || !content || (title.length > 255 && content.length > 255)) {
    return res
      .status(400)
      .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
  // title의 길이가 255를 넘는 경우
  if (title.length > 255) {
    return res
      .status(400)
      .json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
  }
  // content의 길이가 255를 넘는 경우
  if (content.length > 255) {
    return res
      .status(400)
      .json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
  }

  try {
    await Posts.create({ UserId: userId, title, content });

    return res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ errorMessage: '게시글 작성에 실패하였습니다.' });
  }
});

// 게시글 조회 API
router.get('/posts', async (req, res) => {
  const posts = await Posts.findAll({
    attributes: ['postId', 'title', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({ posts: posts });
});

// 게시글 상세 조회 API
router.get('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  const post = await Posts.findOne({
    attributes: [
      'postId',
      'userId',
      'title',
      'content',
      'createdAt',
      'updatedAt',
    ],
    where: { postId },
  });

  if (!post) {
    return res.status(404).json({ errorMessage: '게시글을 찾을 수 없습니다.' });
  }

  try {
    return res.status(200).json({ post: post });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ errorMessage: '게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 수정 API
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  // 데이터가 정상적으로 전달되지 않는 경우
  if (!title || !content || (title.length > 255 && content.length > 255)) {
    return res
      .status(412)
      .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }
  // title의 길이가 255를 넘는 경우
  if (title.length > 255) {
    return res
      .status(412)
      .json({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
  }
  // content의 길이가 255를 넘는 경우
  if (content.length > 255) {
    return res
      .status(412)
      .json({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
  }

  const post = await Posts.findOne({ where: { postId } });

  // 게시글을 찾을 수 없는 경우
  if (!post) {
    return res.status(404).json({ errorMessage: '게시글을 찾을 수 없습니다.' });
  }
  // 게시글을 수정할 권한이 존재 하지 않는 경우
  if (post.UserId !== userId) {
    return res
      .status(403)
      .json({ errorMessage: '게시글을 수정할 권한이 없습니다.' });
  }

  try {
    await Posts.update(
      { title, content },
      {
        where: {
          [Op.and]: [{ postId }, { UserId: userId }],
        },
      }
    );

    return res.status(200).json({ message: '게시글 수정에 성공하였습니다.' });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ errorMessage: '게시글 수정에 실패하였습니다.' });
  }
});

// 게시글 삭제 API
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const post = await Posts.findOne({ where: { postId } });

  // 게시글을 찾을 수 없는 경우
  if (!post) {
    return res.status(404).json({ errorMessage: '게시글을 찾을 수 없습니다.' });
  }
  // 게시글을 삭제할 권한이 존재 하지 않는 경우
  if (post.UserId !== userId) {
    return res
      .status(403)
      .json({ errorMessage: '게시글을 삭제할 권한이 없습니다.' });
  }

  try {
    await Posts.destroy({
      where: {
        [Op.and]: [{ postId }, { UserId: userId }],
      },
    });

    return res.status(200).json({ message: '게시글 삭제에 성공하였습니다.' });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
  }
});

module.exports = router;
