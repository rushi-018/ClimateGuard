"""
Script to run database migrations
"""
import subprocess
import sys
import os

def run_command(command):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error output: {e.stderr}")
        return False

def main():
    """Run database migrations"""
    print("Running database migrations...")
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.dirname(__file__))
    os.chdir(backend_dir)
    
    # Check if alembic is initialized
    if not os.path.exists("alembic"):
        print("Initializing Alembic...")
        if not run_command("alembic init alembic"):
            sys.exit(1)
    
    # Generate migration if models have changed
    print("Generating migration...")
    if not run_command("alembic revision --autogenerate -m 'Auto migration'"):
        print("No changes detected or error generating migration")
    
    # Apply migrations
    print("Applying migrations...")
    if not run_command("alembic upgrade head"):
        print("Error applying migrations")
        sys.exit(1)
    
    print("Migrations completed successfully!")

if __name__ == "__main__":
    main()
