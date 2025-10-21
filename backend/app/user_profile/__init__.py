# Import all components for easy access
from .routes import user_profile_router
from .services import UserProfileService
from .schemas import (
    UserProfileUpdateModel,
    UserIndustryNicheUpdateModel,
    UserProfileModel,
    UserIndustryNicheResponseModel,
    MessageResponseModel,
)

# Export all components
__all__ = [
    "user_profile_router",
    "UserProfileService",
    "UserProfileUpdateModel",
    "UserIndustryNicheUpdateModel",
    "UserProfileModel",
    "UserIndustryNicheResponseModel",
    "MessageResponseModel",
]
