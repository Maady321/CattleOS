import factory
from factory.alchemy import SQLAlchemyModelFactory
from app.models.user import User, UserRole
from app.models.farm import Farm, FarmMembership
from app.core.security import get_password_hash
import uuid

class BaseFactory(SQLAlchemyModelFactory):
    class Meta:
        abstract = True
        sqlalchemy_session_persistence = "commit"

class UserFactory(BaseFactory):
    class Meta:
        model = User

    id = factory.LazyFunction(uuid.uuid4)
    email = factory.Faker("email")
    phone_number = factory.Faker("phone_number")
    full_name = factory.Faker("name")
    hashed_password = factory.LazyFunction(lambda: get_password_hash("password123"))
    is_active = True
    is_verified = True
    is_superuser = False
    role = UserRole.OWNER

class FarmFactory(BaseFactory):
    class Meta:
        model = Farm

    id = factory.LazyFunction(uuid.uuid4)
    name = factory.Faker("company")
    location = factory.Faker("address")
    status = "ACTIVE"
    owner = factory.SubFactory(UserFactory)

class FarmMembershipFactory(BaseFactory):
    class Meta:
        model = FarmMembership

    id = factory.LazyFunction(uuid.uuid4)
    user = factory.SubFactory(UserFactory)
    farm = factory.SubFactory(FarmFactory)
    role = UserRole.WORKER
    status = "ACTIVE"
