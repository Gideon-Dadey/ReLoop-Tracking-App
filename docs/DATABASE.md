# ReLoop Database Schema Documentation

## Database
- **Primary**: MongoDB (Mongoose).
- **Secondary (Caching)**: Redis (for queue management later).

## Collections

### 1. Users
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier. |
| `email` | String | Unique login email. |
| `passwordHash` | String | Bcrypt hash. |
| `userName` | String | Display name. |
| `role` | String | `user`, `vendor`, or `admin`. |
| `organizationId` | ObjectId | Reference to `Organization`. |
| `points` | Number | User's loyalty balance. |
| `impact` | Object | `{ plasticSaved: Number, co2Saved: Number }`. |
| `refreshToken` | String | JWT for session persistence. |

### 2. Organizations (Multi-tenant)
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier. |
| `name` | String | Partner name (e.g., 'Green University'). |
| `settings` | Object | `{ pointsPerReturn: Number, plasticSavedPerUnit: Number, co2SavedPerUnit: Number }`. |
| `analytics` | Object | Global impact stats for the organization. |

### 3. Containers
| Field | Type | Description |
| :--- | :--- | :--- |
| `serialNumber` | String | Unique QR-id. |
| `type` | String | 'Cup', 'Bowl', etc. |
| `status` | String | `available`, `issued`, `returned`, `damaged`. |
| `currentUserId` | ObjectId | Current possessor (optional). |
| `organizationId` | ObjectId | Owner organization. |
| `lastVendorId` | ObjectId | The vendor who last handled it. |

### 4. Transactions (Immutable Audit Trail)
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Reference to `User`. |
| `vendorId` | ObjectId | Reference to the vendor (User). |
| `containerId` | ObjectId | Reference to `Container`. |
| `type` | String | `ISSUE` or `RETURN`. |
| `pointsAwarded` | Number | Balance change. |
| `plasticSaved` | Number | Impact delta. |
| `co2Saved` | Number | Impact delta. |
| `signature` | String | Verifiable hash/signature placeholder. |
| `organizationId` | ObjectId | Scoped organization. |
| `processedAt` | Date | Timestamp of action. |

## Indices
- `Users.email`: Unique index.
- `Containers.serialNumber`: Unique index.
- `Transactions.userId`: Compound with `processedAt` for fast history lookup.
- `Containers.organizationId`: For multi-tenant scoped analytics.
