#!/usr/bin/env python3
"""Load idempotent reference data into Supabase (quizzes + bot users).

Usage (from repo root or backend/):

  cd backend && export DATABASE_URL="postgresql://..." && python scripts/seed_supabase.py

Requires schema from supabase/migrations/001_initial_schema.sql applied first.
"""

from pathlib import Path
import sys

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app import create_app  # noqa: E402
from db import connect_app, seed_reference_data  # noqa: E402


def main() -> None:
    app = create_app()
    with app.app_context():
        conn = connect_app(app)
        try:
            seed_reference_data(conn)
        finally:
            conn.close()
    print("Seed completed.")


if __name__ == "__main__":
    main()
