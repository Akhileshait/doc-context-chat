import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {Queue} from 'bullmq';

const queue = new Queue("file-upload");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());    
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({storage: storage});



app.get('/', (req, res) => {
  res.send('Welcome to the API PDF CHAT!');
});

app.post('/upload/pdf', upload.single('pdf'), (req, res) => {
    queue.add('file-ready', JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    }));

    res.json({
        message: 'PDF uploaded successfully'
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
