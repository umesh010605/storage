# Requirements Document

## Introduction

A blockchain and IPFS-powered file management system that provides an alternative to traditional storage systems. The system enables secure file upload, AES encryption, decentralized storage via IPFS, and blockchain-based file tracking with user authentication.

## Glossary

- **File_Manager**: The main application system that handles file operations
- **Authentication_System**: User login and registration management
- **Encryption_Service**: AES encryption/decryption functionality
- **IPFS_Gateway**: Interface to InterPlanetary File System for decentralized storage
- **Blockchain_Ledger**: Distributed ledger for file metadata and ownership tracking
- **Dashboard**: Main user interface for file management operations
- **Database**: Traditional storage for user data and encrypted file metadata

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to register and login to the system, so that I can securely access my files and maintain ownership.

#### Acceptance Criteria

1. WHEN a new user provides valid registration details, THE Authentication_System SHALL create a new user account
2. WHEN a user provides valid login credentials, THE Authentication_System SHALL authenticate and grant access to the dashboard
3. WHEN invalid credentials are provided, THE Authentication_System SHALL reject access and display appropriate error messages
4. THE Authentication_System SHALL maintain secure session management for authenticated users

### Requirement 2: File Upload and Management

**User Story:** As an authenticated user, I want to upload files through the dashboard, so that I can store and manage my documents securely.

#### Acceptance Criteria

1. WHEN a user selects a file for upload, THE File_Manager SHALL accept the file and display upload progress
2. WHEN a file upload is initiated, THE File_Manager SHALL validate file type and size constraints
3. WHEN file upload fails, THE File_Manager SHALL display error messages and allow retry
4. THE Dashboard SHALL display a list of all uploaded files with metadata

### Requirement 3: AES Encryption with User-Provided Keys

**User Story:** As a user, I want to provide my own secret key for file encryption, so that I have complete control over my data security and the system never stores my encryption keys (zero-knowledge approach).

#### Acceptance Criteria

1. WHEN a file is uploaded, THE Encryption_Service SHALL prompt the user for a secret key and encrypt the file using AES encryption with that key
2. WHEN a file is requested for download, THE Encryption_Service SHALL prompt the user for the secret key and decrypt the file using the provided key
3. THE Encryption_Service SHALL derive encryption keys from user-provided passwords using PBKDF2 key derivation
4. THE Encryption_Service SHALL NOT store user-provided secret keys in any form
5. WHEN an incorrect secret key is provided for decryption, THE Encryption_Service SHALL return an error indicating decryption failure

### Requirement 4: Database Storage

**User Story:** As a system administrator, I want file metadata and user information stored in a database, so that the system can efficiently manage and retrieve data.

#### Acceptance Criteria

1. WHEN a user registers, THE Database SHALL store user account information securely
2. WHEN a file is uploaded and encrypted, THE Database SHALL store file metadata including hash, size, and encryption details
3. THE Database SHALL maintain relationships between users and their files
4. WHEN queried, THE Database SHALL return file metadata for authorized users only

### Requirement 5: IPFS Integration

**User Story:** As a user, I want my encrypted files stored on IPFS, so that I can benefit from decentralized storage resilience.

#### Acceptance Criteria

1. WHEN a file is encrypted, THE IPFS_Gateway SHALL store the encrypted file on the IPFS network
2. WHEN a file is requested, THE IPFS_Gateway SHALL retrieve the encrypted file using its IPFS hash
3. THE IPFS_Gateway SHALL return unique IPFS hashes for stored files
4. THE System SHALL maintain mapping between file identifiers and IPFS hashes

### Requirement 6: Blockchain Integration (Future Phase)

**User Story:** As a user, I want file ownership and metadata recorded on blockchain, so that I have immutable proof of file ownership and integrity.

#### Acceptance Criteria

1. WHEN a file is uploaded, THE Blockchain_Ledger SHALL record file metadata and ownership information
2. WHEN file ownership is queried, THE Blockchain_Ledger SHALL return verifiable ownership records
3. THE Blockchain_Ledger SHALL maintain immutable file history and version tracking
4. THE Blockchain_Ledger SHALL enable file integrity verification through hash comparison

### Requirement 7: Dashboard Interface

**User Story:** As a user, I want an intuitive dashboard interface, so that I can easily manage my files and view system status.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard, THE Dashboard SHALL display file upload functionality prominently
2. WHEN files are uploaded, THE Dashboard SHALL show real-time upload progress and status
3. THE Dashboard SHALL display a list of user's files with download and delete options
4. WHEN system operations occur, THE Dashboard SHALL provide clear feedback and status updates