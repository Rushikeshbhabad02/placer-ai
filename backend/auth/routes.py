from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.user import User
from models.student_profile import StudentProfile
from schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from .security import hash_password, verify_password, create_access_token
from .dependencies import get_db, get_current_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Registers a new student, recruiter, or mentor account."""
    role = user_in.role.lower().strip()
    if role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Public registration as admin is restricted"
        )

    if role not in ["student", "recruiter", "mentor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be student, recruiter, or mentor"
        )

    normalized_email = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered"
        )

    hashed_pw = hash_password(user_in.password)
    user = User(
        full_name=user_in.full_name.strip(),
        email=normalized_email,
        password_hash=hashed_pw,
        role=role,
        phone=user_in.phone.strip() if user_in.phone else None,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if role == "student":
        profile = StudentProfile(user_id=user.id)
        db.add(profile)
        db.commit()

    return user

@router.post("/login", response_model=TokenResponse)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a user and issues a signed JWT access token."""
    normalized_email = login_in.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive"
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile information for the currently authenticated user."""
    return current_user

# Role-based test endpoints
@router.get("/student-test")
def student_test(current_user: User = Depends(require_role(["student"]))):
    return {"message": f"Welcome student {current_user.full_name}"}

@router.get("/recruiter-test")
def recruiter_test(current_user: User = Depends(require_role(["recruiter"]))):
    return {"message": f"Welcome recruiter {current_user.full_name}"}

@router.get("/mentor-test")
def mentor_test(current_user: User = Depends(require_role(["mentor"]))):
    return {"message": f"Welcome mentor {current_user.full_name}"}

@router.get("/admin-test")
def admin_test(current_user: User = Depends(require_role(["admin"]))):
    return {"message": f"Welcome admin {current_user.full_name}"}
