# RideOne Backend

A sophisticated ride-sharing assignment system built with Node.js, TypeScript, and Prisma. This backend handles driver-passenger matching, route optimization, and real-time assignment management.

## 🚀 Features

- **Smart Assignment Algorithm**: Optimal driver-passenger matching using Hungarian algorithm
- **Real-time Updates**: WebSocket integration for live tracking and status updates
- **Route Optimization**: Google Maps API integration for route planning and carpool opportunities
- **Crash Resilience**: Robust error handling and transaction-based operations
- **RESTful API**: Clean, well-documented endpoints
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Database Integration**: Prisma ORM with PostgreSQL/MySQL support
- **Code Quality**: ESLint + Prettier configuration with comprehensive linting rules

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: Prisma ORM (PostgreSQL/MySQL)
- **Real-time**: Socket.IO
- **Maps**: Google Maps Services
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier
- **File Upload**: Multer

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rideone/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/rideone"

# Google Maps API
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Distance Matrix AI (optional alternative)
DISTANCE_MATRIX_AI_KEY="your-distance-matrix-key"

# Server Configuration
PORT=3000
NODE_ENV="development"

# JWT (if authentication is implemented)
JWT_SECRET="your-jwt-secret"
```

## 🏗️ Project Structure

```
backend/
├── _test_/                 # Test files
│   └── parseGoogleRoute.test.ts
├── controllers/            # Route handlers
│   ├── admin.ts
│   ├── assingment.ts      # Assignment management
│   ├── driverController.ts
│   ├── passengersControllers.ts
│   └── index.ts
├── middlewares/           # Express middlewares
│   ├── authMiddleware.ts
│   └── upload.ts
├── routes/                # API routes
│   ├── assignment.ts
│   ├── driverRoutes.ts
│   ├── passengersRoute.ts
│   └── user.ts
├── services/              # Business logic
│   ├── assign.ts          # Core assignment algorithms
│   ├── assignments.ts     # Assignment utilities
│   ├── driver.ts          # Driver management
│   ├── googleMap.ts       # Maps integration
│   └── passengers.ts      # Passenger management
├── utils/                 # Helper functions
│   ├── helpers.ts         # General utilities
│   ├── hungarian.ts       # Hungarian algorithm implementation
│   ├── parseGoogleRoute.ts
│   └── prisma.ts          # Database client
├── jobs/                  # Background jobs
│   └── assignmentSchedulers.ts
├── app.ts                 # Express app setup
├── server.ts              # Server entry point
└── package.json
```

## 🔌 API Endpoints

### Assignments
- `POST /api/v1/assignment/trigger-assignment` - Trigger assignment cycle
- `PUT /api/v1/assignment/drivers/:driverId/status` - Update driver status
- `GET /api/v1/assignment/all-assignments` - Get all assignments
- `GET /api/v1/assignment/along-trip` - Get carpool assignments

### Drivers
- `GET /api/v1/drivers` - List all drivers
- `POST /api/v1/drivers` - Create new driver
- `PUT /api/v1/drivers/:id` - Update driver
- `DELETE /api/v1/drivers/:id` - Delete driver

### Passengers
- `GET /api/v1/passengers` - List all passengers
- `POST /api/v1/passengers` - Create new passenger
- `POST /api/v1/passengers/bulk-csv` - Bulk import from CSV
- `PUT /api/v1/passengers/:id` - Update passenger
- `DELETE /api/v1/passengers/:id` - Delete passenger

## 🧮 Assignment Algorithm

The system uses a sophisticated multi-phase assignment process:

### Phase 1: Initial Matching
- Uses Hungarian algorithm for optimal driver-passenger pairing
- Considers travel time, passenger wait time, and driver availability
- Implements race condition handling with atomic database updates

### Phase 2: Route Enhancement
- Identifies carpool opportunities along existing routes
- Uses Google Maps Directions API for route optimization
- Automatically adds compatible passengers to trips

### Phase 3: Fallback Assignment
- Handles remaining unassigned passengers
- Performs robust availability checks
- Ensures no double-booking of drivers

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable lint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Prisma Studio
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in the `_test_/` directory and follow the naming convention `*.test.ts`.

## 🚦 WebSocket Events

### Client Events
- `authenticate` - Authenticate user (driver/passenger)
- `location-update` - Send location updates
- `join-tracking` - Join admin tracking room

### Server Events
- `driver-location-update` - Real-time driver location
- `passenger-location-update` - Real-time passenger location
- `assignment-status-update` - Assignment status changes
- `driver-status-update` - Driver status changes

## 🔍 Code Quality

The project maintains high code quality standards:

- **ESLint**: Comprehensive linting rules for TypeScript
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled
- **Git Hooks**: Pre-commit hooks for code quality
- **No Unused Variables**: All imports and variables are used
- **Strict Equality**: Uses `===` and `!==` operators
- **Const Preference**: Prefers `const` over `let` where applicable

## 🐛 Error Handling

The system implements robust error handling:

- Global error middleware
- Transaction-based database operations
- Race condition prevention
- Graceful API error responses
- Comprehensive logging

## 🔒 Security Considerations

- Input validation on all endpoints
- File upload restrictions (CSV only)
- Environment variable protection
- SQL injection prevention via Prisma
- Rate limiting ready (implement as needed)

## 📈 Performance Optimizations

- Efficient Hungarian algorithm implementation
- Database query optimization
- Caching for repeated calculations
- Bulk operations for CSV imports
- Connection pooling

## 🚢 Deployment

### Docker (Recommended)
```bash
# Build Docker image
docker build -t rideone-backend .

# Run container
docker run -p 3000:3000 --env-file .env rideone-backend
```

### Traditional Deployment
```bash
# Build the project
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run code quality checks**:
   ```bash
   npm run lint
   npm run format
   npm test
   ```
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Maintain test coverage above 80%
- Follow the existing project structure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Maps API for routing and geocoding
- Prisma team for the excellent ORM
- Hungarian Algorithm implementation contributors
- Socket.IO for real-time capabilities

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Coding!** 🚗💨
