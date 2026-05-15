# ReLoop Backend Documentation

## Architecture
The backend is built with **NestJS** and follows a modular, domain-driven design. It leverages **Mongoose** for MongoDB interactions and **Passport.js** for JWT-based security.

### Core Modules
- **Auth**: Manages registration, login, and JWT strategy.
- **Users**: Handles profile data, points, and impact metrics.
- **Organizations**: Multi-tenant isolation; each partner organization has its own settings (e.g., `pointsPerReturn`).
- **Containers**: Tracks the lifecycle of QR-coded assets (Available -> Issued -> Returned).
- **Transactions**: An immutable log of all container movements for auditing.
- **Sync**: Handles bulk upload of offline scans from vendor devices.
- **Blockchain**: Abstraction layer for verifiable transaction signing.
- **AI Coach**: Recommender service based on user behavior patterns.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/auth/register` | Create a new user or vendor. |
| POST | `/auth/login` | Login and receive `accessToken` and `refreshToken`. |

### Containers & Scans
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| POST | `/containers/issue` | Vendor issues a container to a user's account. | `VENDOR`, `ADMIN` |
| POST | `/containers/return` | Vendor marks a container as returned. Updates impact metrics. | `VENDOR`, `ADMIN` |

### Offline Sync
| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| POST | `/sync/bulk` | Bulk process a list of `ScanEventDto` from an offline queue. | `VENDOR`, `ADMIN` |

## Security
- **Helmet**: Adds security-related headers.
- **CORS**: Enabled for mobile and web clients.
- **Rate Limiting**: Limits repeat requests to prevent brute-force attacks.
- **RBAC**: Guard-based access control (User, Vendor, Admin).
- **Validation**: Strict `class-validator` pipes for all incoming payloads.

## Multi-tenancy
Every major entity (`User`, `Container`, `Transaction`) contains an `organizationId`. 
All queries should be scoped to this ID to ensure data isolation between different partners.
