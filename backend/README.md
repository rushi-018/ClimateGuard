# ClimateGuard API

A FastAPI backend for climate risk prediction and monitoring, providing endpoints for risk assessment, global climate mapping, and adaptive action recommendations.

## Features

- **Climate Risk Prediction**: Predict climate risks based on regional and weather data
- **Global Climate Mapping**: Get worldwide climate risk data in GeoJSON format
- **Adaptive Actions**: Retrieve climate adaptation and mitigation strategies
- **PostgreSQL Integration**: Robust database with SQLAlchemy ORM
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Rate Limiting**: Built-in request rate limiting
- **Comprehensive Logging**: Request/response logging and error tracking

## API Endpoints

### Predictions
- `POST /api/predict` - Predict climate risk for a region
- `GET /api/predict/history/{region_name}` - Get prediction history

### Global Map
- `GET /api/global-map` - Get global climate risk data (GeoJSON)
- `GET /api/regions` - Get summary of all regions with risk data

### Actions
- `GET /api/actions` - Get adaptive climate action strategies
- `GET /api/actions/{action_id}` - Get specific action details
- `GET /api/actions/categories` - Get available action categories
- `GET /api/actions/priorities` - Get available priority levels

### Health
- `GET /` - Basic health check
- `GET /health` - Detailed health check

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip or poetry

### Installation

1. **Clone and navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Create virtual environment**
   \`\`\`bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

5. **Set up database**
   \`\`\`bash
   # Create PostgreSQL database
   createdb climateguard
   
   # Initialize Alembic (first time only)
   alembic init alembic
   
   # Create initial migration
   alembic revision --autogenerate -m "Initial migration"
   
   # Apply migrations
   alembic upgrade head
   \`\`\`

6. **Run the application**
   \`\`\`bash
   python main.py
   \`\`\`

The API will be available at `http://localhost:8000`

### Docker Setup (Alternative)

1. **Build and run with Docker Compose**
   \`\`\`bash
   docker-compose up --build
   \`\`\`

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

\`\`\`env
# Database
DATABASE_URL=postgresql://username:password@localhost/climateguard

# Security
SECRET_KEY=your-secret-key-here

# Application
DEBUG=True
LOG_LEVEL=INFO

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
\`\`\`

### Database Configuration

The application uses PostgreSQL with SQLAlchemy. Database models are located in `app/models/`:

- **Region**: Geographic regions with coordinates
- **Prediction**: Climate risk predictions with scores and metadata
- **RiskScore**: Current and historical risk scores by region

## API Usage Examples

### Predict Climate Risk

\`\`\`bash
curl -X POST "http://localhost:8000/api/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "New York",
    "climate_data": {
      "temperature": 35.5,
      "precipitation": 25.0,
      "humidity": 75.0,
      "wind_speed": 15.0
    }
  }'
\`\`\`

Response:
\`\`\`json
{
  "risk_score": 0.742,
  "risk_label": "high",
  "confidence": 0.856,
  "risk_type": "heatwave",
  "region": "New York",
  "prediction_date": "2024-01-15T10:30:00"
}
\`\`\`

### Get Global Climate Map

\`\`\`bash
curl "http://localhost:8000/api/global-map?min_risk=0.5"
\`\`\`

### Get Adaptive Actions

\`\`\`bash
curl "http://localhost:8000/api/actions?risk_type=flood&priority=high"
\`\`\`

## Development

### Project Structure

\`\`\`
backend/
├── app/
│   ├── models/          # SQLAlchemy models
│   ├── routers/         # API route handlers
│   ├── schemas/         # Pydantic models
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   └── database.py      # Database configuration
├── alembic/             # Database migrations
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
└── README.md           # This file
\`\`\`

### Adding New Features

1. **Models**: Add new SQLAlchemy models in `app/models/`
2. **Schemas**: Define Pydantic schemas in `app/schemas/`
3. **Services**: Implement business logic in `app/services/`
4. **Routes**: Add API endpoints in `app/routers/`
5. **Migrations**: Generate with `alembic revision --autogenerate`

### Testing

\`\`\`bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
\`\`\`

### Code Quality

\`\`\`bash
# Format code
black app/

# Lint code
flake8 app/

# Type checking
mypy app/
\`\`\`

## Deployment

### Production Setup

1. **Set production environment variables**
2. **Use a production WSGI server**:
   \`\`\`bash
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   \`\`\`
3. **Set up reverse proxy** (nginx recommended)
4. **Configure SSL/TLS certificates**
5. **Set up monitoring and logging**

### Docker Production

\`\`\`dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
\`\`\`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Monitoring and Logging

The application includes:

- **Request/Response Logging**: All API calls are logged
- **Error Tracking**: Detailed error logs with stack traces
- **Performance Metrics**: Response time tracking
- **Rate Limiting**: Configurable request rate limits

Logs are written to both console and `climateguard.log` file.

## Machine Learning Integration

The current prediction service uses dummy logic for demonstration. To integrate real ML models:

1. Replace `PredictionService._calculate_risk_score()` with your model
2. Add model loading and inference logic
3. Update confidence calculation based on model metrics
4. Consider adding model versioning and A/B testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the logs in `climateguard.log`
