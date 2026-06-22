import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { MediaItem } from '../models/MediaItem.js';
import { mapDoc, mapDocs } from '../config/db.js';
import { authRequired, adminRequired, canAccessCourse, isOwnerUser } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 * 1024 } });

function isVideoFile(file) {
  if (file.mimetype?.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(file.originalname || '');
}

const STORAGE_QUOTA_BYTES = 100 * 1024 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function fileSizeOnDisk(item) {
  if (!item.url?.startsWith('/uploads/')) return 0;
  const filePath = path.join(uploadsDir, path.basename(item.url));
  if (!fs.existsSync(filePath)) return 0;
  return fs.statSync(filePath).size;
}

function itemSizeBytes(item) {
  if (item.sizeBytes > 0) return item.sizeBytes;
  return fileSizeOnDisk(item);
}

const router = Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const items = await MediaItem.find().sort({ createdAt: -1 });
    const filtered = mapDocs(items).filter((i) => canAccessCourse(req.user, i.course));
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/storage', async (req, res) => {
  if (!isOwnerUser(req.user)) {
    return res.status(403).json({ success: false, message: 'Head admin access required' });
  }
  try {
    const items = await MediaItem.find({ type: { $in: ['video', 'pdf'] } });
    let videoBytes = 0;
    let pdfBytes = 0;
    let videoCount = 0;
    let pdfCount = 0;

    for (const item of items) {
      const bytes = itemSizeBytes(item);
      if (item.type === 'video') {
        videoBytes += bytes;
        videoCount += 1;
      } else {
        pdfBytes += bytes;
        pdfCount += 1;
      }
    }

    const usedBytes = videoBytes + pdfBytes;
    const percentUsed = Math.min(100, (usedBytes / STORAGE_QUOTA_BYTES) * 100);
    const roundedPercent = Math.round(percentUsed * 10) / 10;

    res.json({
      quotaBytes: STORAGE_QUOTA_BYTES,
      quotaLabel: '100 GB',
      usedBytes,
      usedLabel: formatBytes(usedBytes),
      percentUsed: roundedPercent,
      percentLabel: `${Math.round(percentUsed)}%`,
      videoCount,
      pdfCount,
      videoBytes,
      pdfBytes,
      videoLabel: formatBytes(videoBytes),
      pdfLabel: formatBytes(pdfBytes)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', adminRequired, upload.array('files', 20), async (req, res) => {
  try {
    const course = req.body.course || 'jee';
    const files = req.files ?? [];
    const created = [];

    for (const file of files) {
      const isVideo = isVideoFile(file);
      const url = `/uploads/${file.filename}`;
      const item = await MediaItem.create({
        title: req.body.title || file.originalname,
        type: isVideo ? 'video' : 'pdf',
        url,
        course,
        thumbnail: isVideo ? (req.body.thumbnail || undefined) : undefined,
        description: req.body.description || file.originalname,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        sizeBytes: file.size,
        dateModified: new Date().toISOString().slice(0, 10),
        uploadedBy: req.user.id
      });
      created.push(mapDoc(item));
    }

    if (!created.length) {
      return res.status(400).json({ success: false, message: 'No files received' });
    }

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', adminRequired, upload.single('file'), async (req, res) => {
  try {
    const item = await MediaItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'File not found' });

    if (req.body.title?.trim()) item.title = req.body.title.trim();
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.course) item.course = req.body.course;

    if (req.file) {
      if (item.url?.startsWith('/uploads/')) {
        const oldPath = path.join(uploadsDir, path.basename(item.url));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const isVideo = isVideoFile(req.file);
      item.url = `/uploads/${req.file.filename}`;
      item.type = isVideo ? 'video' : 'pdf';
      item.size = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
      item.sizeBytes = req.file.size;
      item.dateModified = new Date().toISOString().slice(0, 10);
      if (!isVideo) item.thumbnail = undefined;
    } else if (req.body.title || req.body.description !== undefined || req.body.course) {
      item.dateModified = new Date().toISOString().slice(0, 10);
    }

    await item.save();
    res.json(mapDoc(item));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', adminRequired, async (req, res) => {
  try {
    const item = await MediaItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'File not found' });

    if (item.url.startsWith('/uploads/')) {
      const filePath = path.join(uploadsDir, path.basename(item.url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
