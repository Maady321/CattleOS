import sys
import os
sys.path.append(os.getcwd())

try:
    from app.services.resource_auth_service import resource_auth_service
    print("Import successful")
except Exception as e:
    import traceback
    traceback.print_exc()
