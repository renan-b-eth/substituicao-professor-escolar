import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();
const controller = new UploadController();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      '.xlsx',
      '.xls',
      '.csv',
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use XLSX, XLS ou CSV.'));
    }
  },
});

// Routes - Apenas SECRETARY e SUPER_ADMIN podem importar planilhas
router.post(
  '/schedule',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.SECRETARY),
  upload.single('file'),
  controller.importSchedule.bind(controller)
);

router.post(
  '/teachers',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.SECRETARY),
  upload.single('file'),
  controller.importTeachers.bind(controller)
);

export default router;