from .user import create as create_user, authenticate, get_by_phone
from .farm import create as create_farm

# Exporting for convenience
user = type('obj', (object,), {'create': create_user, 'authenticate': authenticate, 'get_by_phone': get_by_phone})
farm = type('obj', (object,), {'create': create_farm})
