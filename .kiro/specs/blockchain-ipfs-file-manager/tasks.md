# Implementation Plan: Blockchain and IPFS File Manager

## Overview

This implementation plan creates a TypeScript-based file management system with React frontend and Node.js backend. The approach focuses on building core functionality first (authentication, file upload, encryption, database storage) with future phases for IPFS and blockchain integration.

**IMPORTANT SECURITY UPDATE**: The system now uses a zero-knowledge encryption approach where users provide their own secret keys/passwords for file encryption. The system NEVER stores user-provided secrets - only the salt and IV needed for decryption when the user provides their secret again. This gives users complete control over their encryption keys.

## Tasks

- [x] 1. Set up project structure and development environment
  - Create React TypeScript frontend with Vite
  - Set up Node.js TypeScript backend with Express
  - Configure ESLint, Prettier, and TypeScript configs
  - Set up package.json scripts for development
  - _Requirements: All requirements depend on proper project setup_

- [ ] 2. Implement database schema and connection
  - Set up PostgreSQL database with connection pooling
  - Create users and files table schemas (with encryption_salt and encryption_iv fields, NOT encryption_key)
  - Implement database migration scripts
  - Create TypeScript interfaces for data models
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 2.1 Write property test for database operations
  - **Property 11: Database persistence consistency**
  - **Validates: Requirements 4.1, 4.2**

- [ ] 3. Implement authentication system
  - [x] 3.1 Create user registration endpoint with validation
    - Implement password hashing with bcrypt
    - Add email validation and duplicate checking
    - _Requirements: 1.1_

  - [ ]* 3.2 Write property test for user registration
    - **Property 1: Authentication round-trip**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 3.3 Create login endpoint with JWT token generation
    - Implement credential validation
    - Generate and return JWT tokens
    - _Requirements: 1.2_

  - [ ]* 3.4 Write property test for invalid credentials
    - **Property 2: Invalid credential rejection**
    - **Validates: Requirements 1.3**

  - [x] 3.5 Implement JWT middleware for protected routes
    - Create authentication middleware
    - Add session validation and expiration handling
    - _Requirements: 1.4_

  - [ ]* 3.6 Write property test for session management
    - **Property 3: Session management consistency**
    - **Validates: Requirements 1.4**

- [ ] 4. Create encryption service with user-provided keys
  - [ ] 4.1 Implement PBKDF2 key derivation function
    - Create key derivation utility using PBKDF2 with 100,000 iterations
    - Generate random salts for each encryption operation
    - _Requirements: 3.3_

  - [ ]* 4.2 Write property test for PBKDF2 key derivation
    - **Property 8: PBKDF2 key derivation correctness**
    - **Validates: Requirements 3.3**

  - [ ] 4.3 Implement AES-256-GCM encryption with user secrets
    - Create encrypt function that accepts user-provided secret
    - Derive key from user secret using PBKDF2
    - Encrypt file with derived key and return encrypted data, salt, and IV
    - _Requirements: 3.1_

  - [ ] 4.4 Implement AES-256-GCM decryption with user secrets
    - Create decrypt function that accepts user-provided secret, salt, and IV
    - Derive key from user secret using stored salt
    - Decrypt file and handle incorrect key errors
    - _Requirements: 3.2, 3.5_

  - [ ]* 4.5 Write property test for encryption round-trip
    - **Property 7: Encryption round-trip with user-provided keys**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 4.6 Write property test for zero-knowledge key storage
    - **Property 9: Zero-knowledge key storage**
    - **Validates: Requirements 3.4**

  - [ ]* 4.7 Write property test for incorrect key rejection
    - **Property 10: Incorrect key rejection**
    - **Validates: Requirements 3.5**

- [ ] 5. Implement file management backend with user-provided encryption
  - [ ] 5.1 Create file upload endpoint with encryption secret handling
    - Set up multer for file uploads
    - Add file validation (size, type)
    - Accept user-provided encryption secret from request
    - Implement upload progress tracking
    - _Requirements: 2.1, 2.2, 3.1_

  - [ ]* 5.2 Write property test for file upload validation
    - **Property 4: File upload validation**
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 5.3 Integrate user-secret encryption with file upload
    - Encrypt files using user-provided secret during upload
    - Store encrypted files, salt, and IV in database (NOT the user secret)
    - Ensure user secret is never logged or persisted
    - _Requirements: 3.1, 3.4, 4.2_

  - [ ] 5.4 Create file download endpoint with decryption secret handling
    - Implement file retrieval with user-provided decryption secret
    - Add authorization checks for file access
    - Handle incorrect decryption password errors
    - _Requirements: 3.2, 3.5, 4.4_

  - [ ]* 5.5 Write property test for user-file access control
    - **Property 12: User-file relationship integrity**
    - **Validates: Requirements 4.3, 4.4**

  - [ ] 5.6 Implement file deletion endpoint
    - Add file deletion with cleanup
    - Remove database records and encrypted files
    - _Requirements: 2.4_

  - [ ]* 5.7 Write property test for upload error handling
    - **Property 5: Upload error handling**
    - **Validates: Requirements 2.3**

- [ ] 6. Checkpoint - Backend API complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Create React frontend authentication
  - [ ] 7.1 Set up React Router and authentication context
    - Create AuthContext for state management
    - Set up protected route components
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ] 7.2 Create registration page component
    - Build registration form with validation
    - Implement form submission and error handling
    - _Requirements: 1.1_

  - [ ] 7.3 Create login page component
    - Build login form with validation
    - Implement authentication flow
    - _Requirements: 1.2, 1.3_

  - [ ]* 7.4 Write unit tests for authentication components
    - Test form validation and submission
    - Test error handling and user feedback
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 8. Implement dashboard and file management UI with encryption secret prompts
  - [ ] 8.1 Create dashboard layout component
    - Build main dashboard structure
    - Add navigation and user info display
    - _Requirements: 7.1_

  - [ ] 8.2 Create file upload component with encryption secret input
    - Implement drag-and-drop file upload
    - Add modal/form to prompt user for encryption secret/password
    - Add upload progress tracking and status display
    - Securely send file and secret to backend
    - _Requirements: 2.1, 3.1, 7.2_

  - [ ]* 8.3 Write property test for dashboard UI feedback
    - **Property 20: Dashboard UI feedback**
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [ ] 8.4 Create file list component
    - Display user's files with metadata
    - Add download and delete functionality
    - _Requirements: 2.4, 7.3_

  - [ ]* 8.5 Write property test for file list display
    - **Property 6: File list display consistency**
    - **Validates: Requirements 2.4**

  - [ ] 8.6 Implement file download with decryption secret prompt
    - Add modal/form to prompt user for decryption secret/password
    - Send decryption request with user secret to backend
    - Handle incorrect password errors with clear user feedback
    - Download and save decrypted file on success
    - _Requirements: 3.2, 3.5_

  - [ ] 8.7 Implement file deletion
    - Add confirmation dialogs for file deletion
    - Connect to backend delete endpoint
    - _Requirements: 2.4_

  - [ ]* 8.8 Write unit tests for file management components
    - Test file upload with encryption secret flow
    - Test file download with decryption secret flow
    - Test error handling for incorrect passwords
    - Test delete confirmation and execution
    - _Requirements: 2.1, 2.3, 2.4, 3.2, 3.5_

- [ ] 9. Add styling and responsive design
  - [ ] 9.1 Implement responsive CSS with Tailwind/Material-UI
    - Style authentication pages
    - Style dashboard and file management components
    - Style encryption/decryption secret input modals
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 Add loading states and animations
    - Implement loading spinners and progress bars
    - Add smooth transitions and user feedback
    - _Requirements: 7.2, 7.4_

- [ ] 10. Integration testing and error handling
  - [ ] 10.1 Implement comprehensive error handling
    - Add global error boundaries in React
    - Implement API error handling and user notifications
    - Add specific error messages for incorrect decryption passwords
    - _Requirements: 1.3, 2.3, 3.5_

  - [ ]* 10.2 Write integration tests for complete workflows
    - Test end-to-end user registration and login
    - Test complete file upload with encryption secret flow
    - Test complete file download with correct decryption secret
    - Test file download with incorrect decryption secret (should fail)
    - Test file deletion flow
    - _Requirements: All requirements_

- [ ] 11. Final checkpoint and deployment preparation
  - [ ] 11.1 Set up environment configuration
    - Create environment variables for database, JWT secrets
    - Set up production and development configurations
    - Ensure HTTPS is enforced for secure transmission of encryption secrets
    - _Requirements: All requirements_

  - [ ] 11.2 Create build scripts and documentation
    - Set up production build processes
    - Create README with setup and deployment instructions
    - Document the zero-knowledge encryption approach
    - Add user guide for encryption secret management
    - _Requirements: All requirements_

- [ ] 12. Ensure all tests pass and system is ready
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: IPFS Integration Tasks

- [ ] 13. Set up IPFS infrastructure and configuration
  - [x] 13.1 Install IPFS dependencies
    - Install ipfs-http-client or js-ipfs library
    - Add IPFS TypeScript type definitions
    - _Requirements: 5.1, 5.2_

  - [x] 13.2 Configure IPFS connection
    - Add IPFS environment variables (gateway URL, API endpoint, credentials)
    - Create IPFS configuration module
    - Set up connection to IPFS gateway (Infura, Pinata, or local node)
    - _Requirements: 5.1_

  - [x] 13.3 Update database schema for IPFS
    - Add migration to make ipfs_hash NOT NULL
    - Add storage_location column ('ipfs' or 'local')
    - Update existing records with default values
    - _Requirements: 5.3, 5.4_

- [ ] 14. Implement IPFS Service
  - [x] 14.1 Create IPFSService class with core methods
    - Implement uploadFile() method to upload encrypted files to IPFS
    - Implement retrieveFile() method to download files by IPFS hash
    - Implement pinFile() method to pin files for persistence
    - Implement unpinFile() method for cleanup
    - Implement isAvailable() method to check IPFS connectivity
    - _Requirements: 5.1, 5.2_

  - [ ]* 14.2 Write property test for IPFS round-trip
    - **Property 13: IPFS storage round-trip**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 14.3 Write property test for IPFS hash uniqueness
    - **Property 14: IPFS hash uniqueness**
    - **Validates: Requirements 5.3**

  - [x] 14.4 Add IPFS error handling and retry logic
    - Implement exponential backoff for failed uploads
    - Add timeout handling for IPFS operations
    - Implement gateway fallback mechanism
    - _Requirements: 5.1, 5.2_

  - [ ]* 14.5 Write unit tests for IPFS error scenarios
    - Test network unavailable handling
    - Test timeout handling
    - Test retry logic
    - _Requirements: 5.1, 5.2_

- [ ] 15. Integrate IPFS into file upload flow
  - [x] 15.1 Update FileService to use IPFS for uploads
    - After encryption, upload encrypted file to IPFS
    - Store IPFS hash returned from upload
    - Save encrypted file locally as fallback
    - Update database with IPFS hash and storage_location='ipfs'
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 15.2 Implement IPFS upload fallback mechanism
    - If IPFS upload fails, mark storage_location='local'
    - Log IPFS failures for monitoring
    - Ensure upload succeeds even if IPFS unavailable
    - _Requirements: 5.1_

  - [ ]* 15.3 Write property test for file-hash mapping
    - **Property 15: File-hash mapping consistency**
    - **Validates: Requirements 5.4**

  - [ ]* 15.4 Write integration test for complete upload flow with IPFS
    - Test file upload with successful IPFS storage
    - Test file upload with IPFS failure (fallback to local)
    - Verify database records correctly
    - _Requirements: 5.1, 5.3, 5.4_

- [ ] 16. Integrate IPFS into file download flow
  - [x] 16.1 Update FileService to retrieve from IPFS
    - Check storage_location in database
    - If 'ipfs', attempt to retrieve from IPFS using hash
    - If IPFS retrieval fails, fallback to local storage
    - If 'local', retrieve from local storage directly
    - _Requirements: 5.2_

  - [ ]* 16.2 Write property test for IPFS fallback resilience
    - **Property 16: IPFS fallback resilience**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 16.3 Write integration test for download flow with IPFS
    - Test download from IPFS successfully
    - Test download with IPFS failure (fallback to local)
    - Test download from local storage directly
    - _Requirements: 5.2_

- [ ] 17. Update file deletion to handle IPFS
  - [x] 17.1 Implement IPFS cleanup on file deletion
    - Unpin file from IPFS when deleted
    - Delete local fallback copy
    - Remove database record
    - Handle errors gracefully (file may not exist on IPFS)
    - _Requirements: 5.1, 5.2_

  - [ ]* 17.2 Write unit tests for IPFS deletion
    - Test successful unpin and deletion
    - Test deletion when file not on IPFS
    - Test deletion with IPFS unavailable
    - _Requirements: 5.1, 5.2_

- [ ] 18. Add IPFS monitoring and background sync
  - [ ] 18.1 Create background job for IPFS sync
    - Identify files with storage_location='local'
    - Attempt to upload to IPFS in background
    - Update storage_location to 'ipfs' on success
    - _Requirements: 5.1_

  - [ ] 18.2 Add IPFS health check endpoint
    - Create API endpoint to check IPFS connectivity
    - Return IPFS status and statistics
    - _Requirements: 5.1_

  - [ ]* 18.3 Write unit tests for background sync
    - Test sync job identifies local files
    - Test sync job uploads to IPFS
    - Test sync job updates database
    - _Requirements: 5.1_

- [ ] 19. Update frontend to show IPFS status
  - [ ] 19.1 Add IPFS storage indicator to file list
    - Display badge showing 'IPFS' or 'Local' storage
    - Add tooltip explaining storage location
    - _Requirements: 5.1, 5.2_

  - [ ] 19.2 Add IPFS hash display to file details
    - Show IPFS hash (CID) in file metadata
    - Add copy-to-clipboard functionality for hash
    - Add link to IPFS gateway for direct access
    - _Requirements: 5.3_

  - [ ]* 19.3 Write unit tests for IPFS UI components
    - Test storage indicator displays correctly
    - Test IPFS hash display and copy functionality
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 20. Update documentation for IPFS
  - [ ] 20.1 Update README with IPFS setup instructions
    - Document IPFS gateway options (Infura, Pinata, local)
    - Add environment variable configuration guide
    - Explain IPFS fallback mechanism
    - _Requirements: 5.1, 5.2_

  - [ ] 20.2 Update API documentation
    - Document IPFS-related fields in API responses
    - Document IPFS error codes and handling
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 21. Checkpoint - IPFS integration complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on Phase 1 functionality first - IPFS and blockchain integration will be added in future iterations