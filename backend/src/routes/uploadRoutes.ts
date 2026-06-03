import { Router, Request, Response } from 'express';
import { upload } from '../config/cloudinary';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/single', authenticateToken, upload.single('file'), (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    url: req.file.path,
    public_id: req.file.filename
  });
});

router.post('/multiple', authenticateToken, upload.array('files', 5), (req: any, res: Response) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const urls = req.files.map((file: any) => ({
    url: file.path,
    public_id: file.filename
  }));
  res.json(urls);
});

export default router;
