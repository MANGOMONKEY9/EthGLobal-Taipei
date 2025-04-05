// server/index.ts
import express, { Request, Response } from 'express';
import { verifyCloudProof } from '@worldcoin/minikit-js'; // Correct import [[1]]
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { payload, action,} = req.body; // Receive full payload from client
    const app_id = process.env.WORLD_APP_ID as `app_${string}`;

    // Verify using minikit-js [[1]]
    const verifyRes = await verifyCloudProof(
      payload,
      app_id,
      action,
    );

    res.status(200).json({ success: verifyRes.success });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ success: false });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});