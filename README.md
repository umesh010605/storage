# 🔐 Secure File Storage System using AES & IPFS

A full-stack web application for secure, decentralized file storage with AES-256 encryption, IPFS via Pinata, and blockchain transaction logging.

---

## 📖 Description / Overview

This project solves the problem of insecure and centralized file storage. Files are encrypted on the server before being stored on IPFS (a decentralized network), meaning no one — not even the server — can read your files without the encryption key. Every file action (upload, download, delete) is recorded as an immutable block on a local blockchain, providing a tamper-proof audit trail.

- Ensures files are never stored in plain text
- Uses AES-256-CBC encryption with PBKDF2 key derivation
- Stores encrypted files on IPFS via Pinata for decentralized access
- Logs all file transactions on a Proof-of-Work blockchain
- Gives users full control over their files with secure authentication

---

## 🚀 Features

- User registration and JWT-based authentication
- AES-256-CBC file encryption before upload
- PBKDF2 key derivation with unique random salt and IV per file
- Decentralized storage on IPFS via Pinata Cloud
- Blockchain transaction log for every upload, download, and delete
- Proof-of-Work block mining for tamper-proof records
- **Blockchain integrity verification** — verify the entire chain hasn't been tampered with
- **File integrity check** — verify a specific file's IPFS hash against its blockchain record
- **File history** — view the full blockchain audit trail for any file
- **Blockchain export** — download the full chain as JSON
- Secure file download with automatic decryption
- Download encrypted file (raw) without decryption
- Upload stats dashboard
- Support for images, PDFs, Word documents, and plain text files

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 |
| Encryption | AES-256-CBC, PBKDF2 (Node.js `crypto`) |
| Decentralized Storage | IPFS via Pinata Cloud |
| Blockchain | Custom Proof-of-Work chain (SHA-256) |
| Auth | JWT (JSON Web Tokens), bcrypt |
| Containerization | Docker, Docker Compose |

---

## 📂 Project Structure

```
blockchain-file-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route handlers (Auth, File)
│   │   ├── services/         # Core logic (Encryption, IPFS, Blockchain)
│   │   ├── models/           # Data models (User, File)
│   │   ├── repositories/     # Database queries
│   │   ├── routes/           # API route definitions
│   │   ├── middleware/        # Auth & upload middleware
│   │   ├── migrations/       # SQL migration files
│   │   ├── scripts/          # DB migration runner
│   │   ├── utils/            # Helpers
│   │   └── server.ts         # App entry point
│   ├── uploads/              # Local encrypted file storage
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/            # Dashboard, Login, Register
│   │   ├── services/         # API client
│   │   ├── contexts/         # Auth context
│   │   └── types/            # TypeScript types
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Pinata account → [pinata.cloud](https://pinata.cloud)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/blockchain-file-manager.git
cd blockchain-file-manager
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blockchain_file_manager
DB_USER=postgres
DB_PASSWORD=your_db_password

JWT_SECRET=your-random-secret-key

PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
IPFS_ENABLED=true
```

### 4. Run database migrations

```bash
cd backend
npm run migrate
```

### 5. Start the development servers

```bash
# From the root directory — starts both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health check: http://localhost:3001/api/health

---

## 🐳 Docker Setup

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## ▶️ Usage

1. Register an account or log in
2. Upload a file — it gets encrypted with AES-256 and stored on IPFS
3. A blockchain block is mined and the transaction is recorded
4. View your files on the dashboard with upload stats
5. Download a file — it is retrieved from IPFS and decrypted automatically
6. Delete a file — the action is logged on the blockchain and the file is unpinned from IPFS

---

## 🔐 Security

### Encryption
- Algorithm: AES-256-CBC
- Each file gets a unique random IV (Initialization Vector) and salt generated at upload time
- Keys are derived using PBKDF2 with 100,000 iterations and SHA-256
- Encrypted files are stored as `.enc` files — unreadable without the key and IV

### Authentication
- Passwords hashed with bcrypt before storing in the database
- Sessions managed via signed JWT tokens (24h expiry)
- Protected routes require a valid token on every request

### Blockchain Integrity
- Every file action (upload, download, delete) is recorded as a SHA-256 hashed block
- Blocks are linked via `previousHash` — tampering any block invalidates the entire chain
- Proof-of-Work mining (difficulty 2) adds computational cost to prevent easy forgery
- `GET /api/blockchain/verify` checks the full chain integrity at any time
- `GET /api/files/:id/verify` cross-checks a file's IPFS hash against its blockchain record
- `GET /api/files/:id/history` returns the complete audit trail for any file

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List all user files |
| POST | `/api/files/upload` | Upload and encrypt a file |
| GET | `/api/files/:id` | Get file info (IPFS hash, blockchain tx) |
| GET | `/api/files/:id/download` | Download and decrypt a file |
| GET | `/api/files/:id/download/encrypted` | Download raw encrypted file |
| DELETE | `/api/files/:id` | Delete a file |
| GET | `/api/files/:id/verify` | Verify file integrity against blockchain |
| GET | `/api/files/:id/history` | Get full blockchain audit trail for a file |
| GET | `/api/files/stats` | Get user upload statistics |

### Blockchain
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blockchain/chain` | Get the full blockchain |
| GET | `/api/blockchain/stats` | Get blockchain statistics |
| GET | `/api/blockchain/user` | Get current user's blockchain transactions |
| GET | `/api/blockchain/verify` | Verify entire blockchain integrity |
| GET | `/api/blockchain/export` | Export blockchain as JSON file |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/health/ipfs` | IPFS / Pinata connection status |

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-linkedin)
- Email: your@email.com
