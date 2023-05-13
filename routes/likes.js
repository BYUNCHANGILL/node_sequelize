const express = require('express');
const { Posts, Users, Likes } = require('../models');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

// 좋아요 API
router.put('/posts/:postId/like', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const post = await Posts.findOne({ where: { postId } });
  if (!post) {
    res.status(404).send({ errorMessage: '게시글이 존재하지 않습니다.' });
    return;
  }

  const like = await Likes.findOne({
    where: { UserId: userId, PostId: postId },
  });
  console.log('like', like);
  try {
    if (like) {
      await like.destroy();
      post.likeCount -= 1;
      await post.save();
      return res
        .status(200)
        .json({ message: '게시글의 좋아요를 취소하였습니다.' });
    } else {
      await Likes.create({ UserId: userId, PostId: postId });
      post.likeCount += 1;
      await post.save();
      return res
        .status(200)
        .json({ message: '게시글의 좋아요를 등록하였습니다.' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: '게시글 좋아요에 실패하였습니다.' });
  }
});

// 좋아요 목록 API
// router.get('/posts/like', authMiddleware, async (req, res) => {
//   const { userId } = res.locals.user;

//   try {
//     const posts = await Posts.findAll({
//       attributes: ['postId', 'userId', 'title', 'createdAt', 'updatedAt', 'likeCount'],
//       where: [{ UserId: userId}],
//       order: [['likeCount', 'DESC']],
//     });

//     return res.json(posts);
//   } catch (err) {
//     console.error(err);
//     return res.status(400).json({ error: '좋아요 게시글 조회에 실패하였습니다.' });
//   }
// });
router.get('/posts/like', authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;

  try {
    const likes = await Likes.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Posts,
          attributes: [
            'postId',
            'userId',
            'title',
            'createdAt',
            'updatedAt',
            'likeCount',
          ],
          order: [['likeCount', 'DESC']],
        },
      ],
    });

    // likes 배열을 순회하여 각 like에 연결된 post를 추출합니다.
    const posts = likes.map((like) => like.PostId);

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res
      .status(400)
      .json({ error: '좋아요 게시글 조회에 실패하였습니다.' });
  }
});

module.exports = router;
