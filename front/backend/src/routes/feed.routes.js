import { Router } from 'express';
import { FeedPost } from '../models/FeedPost.js';
import { mapDoc } from '../config/db.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();
router.use(authRequired);

function mapFeedPost(doc) {
  const p = mapDoc(doc);
  p.likes = (doc.likes ?? []).map((id) => id.toString());
  p.comments = (doc.comments ?? []).map((c) => ({
    id: c._id?.toString(),
    authorName: c.authorName,
    text: c.text,
    createdAt: c.createdAt
  }));
  return p;
}

router.get('/', async (_req, res) => {
  try {
    const posts = await FeedPost.find().sort({ createdAt: -1 });
    res.json(posts.map(mapFeedPost));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const post = await FeedPost.create({
      authorId: req.user.id,
      authorName: req.user.name,
      authorRole: req.user.role,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      selected: false
    });
    res.status(201).json(mapFeedPost(post));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const uid = req.user.id;
    const liked = post.likes.some((id) => id.toString() === uid);
    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== uid);
    } else {
      post.likes.push(uid);
    }
    await post.save();
    res.json(mapFeedPost(post));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    const text = req.body.text?.trim();
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({
      authorName: req.user.name,
      text,
      createdAt: new Date().toISOString()
    });
    await post.save();
    res.json(mapFeedPost(post));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/selected', async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const post = await FeedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.selected = !post.selected;
    await post.save();
    res.json(mapFeedPost(post));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
