import logging
from advocatediarysystem.config import LOG_PATH

LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s | %(message)s",
    filename=f"{LOG_PATH}",
    filemode="a"
)

def setup_logger (name):
    return logging.getLogger(f'diary.backend.{name}')