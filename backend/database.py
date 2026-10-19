import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sqlite_db_path = os.path.join(BASE_DIR, "tet_platform.db")

# Connect to MySQL by default, or SQLite fallback
DEFAULT_MYSQL_URL = "mysql+pymysql://tet_user:TetAdmin2026!@localhost:3306/tet_platform?charset=utf8mb4"
DATABASE_URL = os.environ.get("DATABASE_URL", DEFAULT_MYSQL_URL)

try:
    if "sqlite" in DATABASE_URL:
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_recycle=3600,
            pool_pre_ping=True
        )
        # Test connection
        with engine.connect() as conn:
            pass
except Exception:
    # Fallback to SQLite for local development or if MySQL is unreachable
    DATABASE_URL = f"sqlite:///{sqlite_db_path}"
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
