"""Azure Functions entry point for snow-flask-whoami."""

import os
import sys

# Add parent directories to path for snow_flask_core imports
sys.path.insert(
    0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)

import azure.functions as func

from snow_flask_core import create_app
from snow_flask_core.database import SnowflakeDB
from snow_flask_core.logging_config import setup_logging

STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
TEMPLATES_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "templates")
)
KEY_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "rsa_key.p8"))

setup_logging()
SnowflakeDB.set_key_file(KEY_FILE)

app = create_app(template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Azure Functions HTTP trigger handler."""
    return func.WsgiMiddleware(app).handle(req)
