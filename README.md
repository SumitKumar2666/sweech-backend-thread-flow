# Sweech Backend Thread Flow

A comprehensive backend API built for Sweech, implementing user authentication, threaded discussions (posts & comments), and login analytics using NestJS, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Node.js** (LTS)
- **TypeScript**
- **NestJS** (Express-based framework)
- **PostgreSQL** 14.2
- **Prisma** (ORM)
- **JWT** for authentication
- **bcrypt** for password hashing
- **Docker & Docker Compose** for development environment

## Features

### Authentication
- ✅ User registration with email validation
- ✅ Password requirements (12-20 chars, lowercase, numbers, special chars)
- ✅ Korean username validation (1-10 characters)
- ✅ JWT-based authentication (20-minute expiration)
- ✅ User information modification (PATCH)

### Posts
- ✅ Post creation (1-30 char title, 1-1000 char content)
- ✅ Post listing with pagination (max 20 per page)
- ✅ Post detail view
- ✅ Sort by most recent creation time

### Comments
- ✅ Comment creation (1-500 characters)
- ✅ Cursor-based pagination (max 10 per page)
- ✅ Comment deletion (by author or post owner)
- ✅ Sort by most recent creation time

### Login Tracking
- ✅ Login record tracking (user ID, IP address, timestamp)
- ✅ Login history (last 30 records)
- ✅ Weekly login count rankings (Monday-Sunday)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sweech-backend-thread-flow
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start the development environment**
   ```bash
   docker compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker compose exec app npx prisma migrate dev --name init
   ```

5. **Generate Prisma client**
   ```bash
   docker compose exec app npx prisma generate
   ```

The application will be available at:
- **API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database**: PostgreSQL on localhost:5432

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `PATCH /api/users/me` - Update user information (authenticated)

### Posts
- `POST /api/posts` - Create post (authenticated)
- `GET /api/posts` - Get post list with pagination (authenticated)
- `GET /api/posts/:id` - Get post detail (authenticated)

### Comments
- `POST /api/posts/:postId/comments` - Create comment (authenticated)
- `GET /api/posts/:postId/comments` - Get comments with cursor pagination (authenticated)
- `DELETE /api/comments/:id` - Delete comment (authenticated)

### Login Records
- `GET /api/login-records` - Get login records (authenticated)
- `GET /api/login-records/rankings` - Get weekly login rankings (authenticated)

## Development

### Available Scripts

```bash
# Development with hot reload
npm run start:dev

# Build for production
npm run build

# Run production
npm run start:prod

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Prisma commands
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

### Code Quality

The project follows the Google JavaScript style guide and uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

### Database Management

```bash
# View database in Prisma Studio
docker compose exec app npx prisma studio

# Reset database
docker compose exec app npx prisma migrate reset

# Deploy migrations to production
docker compose exec app npx prisma migrate deploy
```

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Authentication guards
│   ├── strategies/      # Passport strategies
│   └── ...
├── users/               # User management module
├── posts/               # Posts module
├── comments/            # Comments module
├── login-records/       # Login tracking module
├── prisma/              # Prisma service and module
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   └── interfaces/      # Common interfaces
└── main.ts              # Application entry point
```

## Testing

The project includes comprehensive test coverage for:
- Unit tests for services
- Integration tests for controllers
- End-to-end tests for API endpoints

Run tests with:
```bash
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   - `DATABASE_URL`: Production PostgreSQL connection string
   - `JWT_SECRET`: 256-bit hex secret key
   - `NODE_ENV`: "production"

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the application**
   ```bash
   npm run start:prod
   ```

## API Documentation

Complete API documentation is available via Swagger UI at `/api/docs` when the application is running.

## License

This project is developed as a senior developer assignment for Sweech and is not licensed for commercial use.

## Contact

For any queries or feedback regarding this project, feel free to connect:

**Sumit Kumar**  
🔗 [LinkedIn](https://www.linkedin.com/in/sumitkumar-dev/)