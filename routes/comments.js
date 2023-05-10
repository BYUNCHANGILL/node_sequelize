const express = require('express');
const { Op } = require('sequelize');
const { Posts } = require('../models');
const { Comments } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 댓글 생성 API
router.post('/posts/:postId/comments', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;

  // 게시글이 존재하지 않는 경우
  const post = await Posts.findOne({ where: { postId } });
  if (!post) {
    return res
      .status(412)
      .json({ errorMessage: '게시글이 존재하지 않습니다.' });
  }

  // 데이터가 정상적으로 전달되지 않는 경우
  if (!comment || comment.length > 255) {
    return res
      .status(400)
      .json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
  }

  try {
    await Comments.create({ PostId: postId, UserId: userId, comment });

    return res.status(201).json({ message: '댓글 작성에 성공하였습니다.' });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ errorMessage: '댓글 작성에 실패하였습니다.' });
  }
});

// 댓글 조회 API
router.get('/posts/:postId/comments', async (req, res) => {
    const { postId } = req.params;

    const post = await Posts.findOne({ where: { postId } });

    // 게시글이 존재하지 않는 경우
    if (!post) {
        return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    try {
        const comments = await Comments.findAll({
            where: { postId },
            attributes: ['commentId', 'userId', 'comment', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ comments: comments });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 조회에 실패하였습니다.' });
    }
});

// 댓글 수정 API
router.put('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    // 게시글이 존재하지 않는 경우
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
        return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    // 댓글이 존재하지 않는 경우
    const comments = await Comments.findOne({ where: { commentId } });
    if (!comments) {
        return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }

    // 댓글 작성자가 아닌 경우
    if (comments.UserId !== userId) {
        return res.status(403).json({ errorMessage: '댓글 작성자가 아닙니다.' });
    }

    // 데이터가 정상적으로 전달되지 않는 경우
    if (!comment || comment.length > 255) {
        return res.status(400).json({ errorMessage: '데이터 형식이 올바르지 않습니다.' });
    }

    try {
        // 댓글 수정
        await Comments.update({ comment }, { where: { commentId } });

        return res.status(200).json({ message: '댓글 수정에 성공하였습니다.' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 수정에 실패하였습니다.' });
    }
});

// 댓글 삭제 API
router.delete('/posts/:postId/comments/:commentId', authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;;
    // 게시글이 존재하지 않는 경우
    const post = await Posts.findOne({ where: { postId } });
    if (!post) {
        return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }

    // 댓글이 존재하지 않는 경우
    const comments = await Comments.findOne({ where: { commentId } });
    if (!comments) {
        return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
    }

    // 댓글 작성자가 아닌 경우
    if (comments.UserId !== userId) {
        return res.status(403).json({ errorMessage: '댓글 작성자가 아닙니다.' });
    }
    
    try {
        // 댓글 삭제
        await Comments.destroy({ where: { commentId } });

        return res.status(200).json({ message: '댓글 삭제에 성공하였습니다.' });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
});


module.exports = router;
