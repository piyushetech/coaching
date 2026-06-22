import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    authorName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
  { _id: true }
);

const feedSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['admin', 'student'], required: true },
    content: { type: String, required: true },
    createdAt: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    selected: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const FeedPost = mongoose.model('FeedPost', feedSchema);
