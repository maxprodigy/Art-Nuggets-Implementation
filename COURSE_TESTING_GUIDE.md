# Course API Testing Guide for RestFox

This document provides comprehensive testing instructions for all course endpoints using RestFox or any REST client.

## Prerequisites

1. **Server running** at `http://localhost:8000` (or your configured host)
2. **Admin account** with role "admin"
3. **Regular user account** for authenticated testing
4. **Valid JWT tokens** for both admin and regular users

## Base URL
```
http://localhost:8000/api/v1/courses
```

---

## Step 1: Get Access Tokens

### Admin Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```
**Save the `access_token` from response**

### Regular User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```
**Save the `access_token` from response**

---

## Step 2: Get Industry and Niche IDs

### Get All Industries
```http
GET /api/v1/industries?limit=100
```
**Note:** Save an `industry_id` from the response

### Get Niches for an Industry
```http
GET /api/v1/niches?industry_id={industry_id}&limit=100
```
**Note:** Save a `niche_id` from the response

---

## ADMIN ROUTES (Require Admin Token)

### 1. Create Course
**Endpoint:** `POST /api/v1/courses`  
**Auth:** Bearer `{admin_access_token}`  
**Headers:**
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Introduction to Digital Art Fundamentals",
  "industry_id": "YOUR_INDUSTRY_UUID_HERE",
  "niche_id": "YOUR_NICHE_UUID_HERE",
  "video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "summary": "Learn the foundational principles of digital art creation, including color theory, composition, and basic digital painting techniques. This comprehensive course is perfect for beginners starting their journey into digital art.",
  "source": "https://example.com/course-source",
  "key_takeaways": [
    {
      "content": "Understanding color theory is fundamental to creating visually appealing digital art"
    },
    {
      "content": "Practice daily sketching improves muscle memory and artistic fluency"
    },
    {
      "content": "Study master artists for inspiration and technique development"
    },
    {
      "content": "Layer management in digital art software increases efficiency and flexibility"
    }
  ],
  "additional_resources": [
    {
      "title": "Digital Art Community Forum",
      "link": "https://example.com/community"
    },
    {
      "title": "Free Brushes Collection",
      "link": "https://example.com/brushes"
    },
    {
      "title": "Color Palette Generator Tool",
      "link": "https://example.com/palette"
    }
  ]
}
```

**Expected Response (201 Created):**
```json
{
  "id": "course-uuid",
  "title": "Introduction to Digital Art Fundamentals",
  "industry_id": "industry-uuid",
  "niche_id": "niche-uuid",
  "video_link": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "summary": "Learn the foundational principles...",
  "source": "https://example.com/course-source",
  "created_at": "2025-11-02T...",
  "updated_at": "2025-11-02T...",
  "key_takeaways": [
    {
      "id": "uuid",
      "content": "Understanding color theory...",
      "order": 0
    },
    {
      "id": "uuid",
      "content": "Practice daily sketching...",
      "order": 1
    },
    ...
  ],
  "additional_resources": [
    {
      "id": "uuid",
      "title": "Digital Art Community Forum",
      "link": "https://example.com/community",
      "order": 0
    },
    ...
  ]
}
```

**Note:** Save the `id` from the response for subsequent operations.

---

### 2. Get Course by ID
**Endpoint:** `GET /api/v1/courses/{course_id}`  
**Auth:** None (Public)  
**Example:**
```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response (200 OK):** Same as Create Course response

---

### 3. Update Course
**Endpoint:** `PUT /api/v1/courses/{course_id}`  
**Auth:** Bearer `{admin_access_token}`  
**Headers:**
```
Authorization: Bearer {admin_access_token}
Content-Type: application/json
```

**Request Body (All fields optional - partial update):**
```json
{
  "title": "Advanced Digital Art Fundamentals",
  "summary": "Updated summary with more advanced techniques",
  "key_takeaways": [
    {
      "content": "New takeaway 1"
    },
    {
      "content": "New takeaway 2"
    }
  ]
}
```

**Expected Response (200 OK):** Updated course details

---

### 4. Delete Course
**Endpoint:** `DELETE /api/v1/courses/{course_id}`  
**Auth:** Bearer `{admin_access_token}`  
**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Expected Response (200 OK):**
```json
{
  "message": "Course deleted successfully"
}
```

---

## PUBLIC ROUTES (No Auth Required)

### 5. Get All Courses (Paginated)
**Endpoint:** `GET /api/v1/courses`  
**Auth:** None

**Query Parameters (all optional):**
- `page`: Page number (default: 1, min: 1)
- `page_size`: Items per page (default: 10, min: 1, max: 100)
- `search`: Search by title (case-insensitive)
- `industry_id`: Filter by industry UUID
- `niche_id`: Filter by niche UUID

**Examples:**

**Basic:**
```http
GET /api/v1/courses
```

**With Pagination:**
```http
GET /api/v1/courses?page=1&page_size=5
```

**With Search:**
```http
GET /api/v1/courses?search=digital
```

**With Filters:**
```http
GET /api/v1/courses?industry_id=YOUR_INDUSTRY_UUID&niche_id=YOUR_NICHE_UUID
```

**Combined:**
```http
GET /api/v1/courses?page=1&page_size=5&search=art&industry_id=YOUR_INDUSTRY_UUID
```

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Course Title",
      "industry_id": "uuid",
      "niche_id": "uuid",
      "video_link": "https://...",
      "summary": "Course summary...",
      "created_at": "2025-11-02T..."
    },
    ...
  ],
  "total": 15,
  "page": 1,
  "page_size": 10,
  "total_pages": 2
}
```

---

### 6. Get Recent Courses
**Endpoint:** `GET /api/v1/courses/recent`  
**Auth:** None

**Query Parameters (optional):**
- `limit`: Number of recent courses (default: 3, min: 1, max: 10)

**Examples:**

**Default (3 courses):**
```http
GET /api/v1/courses/recent
```

**Custom limit:**
```http
GET /api/v1/courses/recent?limit=5
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "uuid",
    "title": "Most recent course",
    "industry_id": "uuid",
    "niche_id": "uuid",
    "video_link": "https://...",
    "summary": "...",
    "created_at": "2025-11-02T..."
  },
  {
    "id": "uuid",
    "title": "Second most recent",
    ...
  },
  ...
]
```

---

## USER ROUTES (Require User Token)

### 7. Toggle Favourite
**Endpoint:** `POST /api/v1/courses/{course_id}/favourite`  
**Auth:** Bearer `{user_access_token}`  
**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Expected Responses:**

**First time (Added):**
```json
{
  "message": "Course added to favourites successfully"
}
```

**Second time (Removed):**
```json
{
  "message": "Course removed from favourites successfully"
}
```

---

### 8. Mark as Completed
**Endpoint:** `POST /api/v1/courses/{course_id}/complete`  
**Auth:** Bearer `{user_access_token}`  
**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Expected Response (200 OK):**
```json
{
  "message": "Course marked as completed successfully"
}
```

**If already completed:**
```json
{
  "message": "Course is already marked as completed"
}
```

---

### 9. Get My Favourites
**Endpoint:** `GET /api/v1/courses/my/favourites`  
**Auth:** Bearer `{user_access_token}`  
**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Query Parameters (optional):**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)

**Example:**
```http
GET /api/v1/courses/my/favourites?page=1&page_size=10
Authorization: Bearer {user_access_token}
```

**Expected Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Favourite course",
      "industry_id": "uuid",
      "niche_id": "uuid",
      "video_link": "https://...",
      "summary": "...",
      "created_at": "2025-11-02T..."
    },
    ...
  ],
  "total": 5,
  "page": 1,
  "page_size": 10,
  "total_pages": 1
}
```

---

### 10. Get My Completed Courses
**Endpoint:** `GET /api/v1/courses/my/completed`  
**Auth:** Bearer `{user_access_token}`  
**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Query Parameters (optional):**
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 10, max: 100)

**Example:**
```http
GET /api/v1/courses/my/completed?page=1&page_size=10
Authorization: Bearer {user_access_token}
```

**Expected Response (200 OK):** Same structure as favourites

---

### 11. Get Course Progress
**Endpoint:** `GET /api/v1/courses/{course_id}/progress`  
**Auth:** Bearer `{user_access_token}`  
**Headers:**
```
Authorization: Bearer {user_access_token}
```

**Example:**
```http
GET /api/v1/courses/550e8400-e29b-41d4-a716-446655440000/progress
Authorization: Bearer {user_access_token}
```

**Expected Response (200 OK):**
```json
{
  "is_favourite": true,
  "is_completed": false,
  "completed_at": null
}
```

**If course is completed:**
```json
{
  "is_favourite": true,
  "is_completed": true,
  "completed_at": "2025-11-02T13:45:30.123456"
}
```

---

## Testing Workflow

### Recommended Testing Order:

1. **Get tokens** (admin and user)
2. **Get industry/niche IDs** 
3. **Admin:** Create 2-3 courses
4. **Public:** Get all courses (verify pagination)
5. **Public:** Get recent courses
6. **Public:** Search courses
7. **Admin:** Update a course
8. **User:** Toggle favourite
9. **User:** Get my favourites
10. **User:** Mark course as completed
11. **User:** Get my completed
12. **User:** Get course progress
13. **Admin:** Delete a course

### Error Testing:

**Test Admin Routes Without Admin Token:**
```http
POST /api/v1/courses
Authorization: Bearer {regular_user_token}
```
**Expected:** 403 Forbidden

**Test with Invalid Course ID:**
```http
GET /api/v1/courses/00000000-0000-0000-0000-000000000000
```
**Expected:** 404 Not Found

**Test Create with Invalid Industry/Niche:**
```json
{
  "industry_id": "00000000-0000-0000-0000-000000000000",
  "niche_id": "00000000-0000-0000-0000-000000000000",
  ...
}
```
**Expected:** 404 Not Found

**Test Create with Niche Not Belonging to Industry:**
```json
{
  "industry_id": "correct-industry-uuid",
  "niche_id": "niche-from-different-industry-uuid",
  ...
}
```
**Expected:** 400 Bad Request

---

## Sample Test Data

### Course 1
```json
{
  "title": "Mastering Watercolor Techniques",
  "industry_id": "YOUR_INDUSTRY_UUID",
  "niche_id": "YOUR_NICHE_UUID",
  "video_link": "https://www.youtube.com/watch?v=example1",
  "summary": "Explore the beautiful world of watercolor painting with comprehensive techniques for beginners and intermediates.",
  "source": "https://example.com/watercolor-source",
  "key_takeaways": [
    {"content": "Understanding water-to-paint ratios is crucial"},
    {"content": "Paper quality dramatically affects results"},
    {"content": "Wet-on-wet vs wet-on-dry techniques"},
    {"content": "Color mixing mastery"}
  ],
  "additional_resources": [
    {"title": "Watercolor Paper Guide", "link": "https://example.com/paper"},
    {"title": "Color Mixing Chart", "link": "https://example.com/mixing"}
  ]
}
```

### Course 2
```json
{
  "title": "Digital Illustration Masterclass",
  "industry_id": "YOUR_INDUSTRY_UUID",
  "niche_id": "YOUR_NICHE_UUID",
  "video_link": "https://www.youtube.com/watch?v=example2",
  "summary": "Learn professional digital illustration workflows from concept to final render.",
  "source": "https://example.com/digital-source",
  "key_takeaways": [
    {"content": "Concept sketching and ideation process"},
    {"content": "Digital brush customization"},
    {"content": "Layer organization strategies"},
    {"content": "Professional finishing techniques"}
  ],
  "additional_resources": []
}
```

### Course 3
```json
{
  "title": "Portrait Drawing Fundamentals",
  "industry_id": "YOUR_INDUSTRY_UUID",
  "niche_id": "YOUR_NICHE_UUID",
  "video_link": "https://www.youtube.com/watch?v=example3",
  "summary": "Master the art of portrait drawing with anatomy, proportion, and shading techniques.",
  "source": "https://example.com/portrait-source",
  "key_takeaways": [
    {"content": "Facial anatomy and proportions"},
    {"content": "Lighting and shadow techniques"},
    {"content": "Capturing likeness and expression"}
  ],
  "additional_resources": [
    {"title": "Anatomy Reference Library", "link": "https://example.com/anatomy"},
    {"title": "Proportion Guide", "link": "https://example.com/proportion"},
    {"title": "Shading Practice Sheets", "link": "https://example.com/shading"}
  ]
}
```

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/courses` | POST | Admin | Create course |
| `/courses/{id}` | GET | Public | Get course by ID |
| `/courses/{id}` | PUT | Admin | Update course |
| `/courses/{id}` | DELETE | Admin | Delete course |
| `/courses` | GET | Public | List courses (paginated, filtered) |
| `/courses/recent` | GET | Public | Get recent courses |
| `/courses/{id}/favourite` | POST | User | Toggle favourite |
| `/courses/{id}/complete` | POST | User | Mark completed |
| `/courses/my/favourites` | GET | User | Get my favourites |
| `/courses/my/completed` | GET | User | Get my completed |
| `/courses/{id}/progress` | GET | User | Get course progress |

---

## Notes

- All UUIDs should be valid UUID v4 format
- Timestamps are in ISO 8601 format
- Pagination starts at page 1
- Search is case-insensitive partial matching
- Ordering of key_takeaways and additional_resources is 0-indexed
- Cascade delete ensures related records are removed when course is deleted
- Unique constraint on (user_id, course_id) prevents duplicate progress records

Happy Testing! 🎨

