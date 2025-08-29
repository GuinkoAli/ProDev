# ALX Polly API Documentation

This document describes the API endpoints for the ALX Polly polling application.

## Base URL

All API endpoints are relative to `/api`

## Authentication

Most endpoints require authentication. The API uses Supabase authentication with JWT tokens. Include the user's session cookie in requests.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### 1. User Polls

#### GET /api/polls
Get all polls created by the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "polls": [
    {
      "poll_id": "uuid",
      "question": "What should we have for lunch?",
      "description": "Team lunch decision",
      "status": "active",
      "is_public": true,
      "allow_multiple_votes": false,
      "expires_at": "2024-12-31T23:59:59Z",
      "created_at": "2024-01-01T00:00:00Z",
      "total_votes": 15
    }
  ]
}
```

#### POST /api/polls
Create a new poll.

**Authentication:** Required

**Request Body:**
```json
{
  "question": "What should we have for lunch?",
  "description": "Team lunch decision",
  "options": ["Pizza", "Sushi", "Burger"],
  "allowMultipleVotes": false,
  "expiresAt": "2024-12-31T23:59:59Z",
  "isPublic": true
}
```

**Response:**
```json
{
  "poll": {
    "poll_id": "uuid",
    "question": "What should we have for lunch?",
    "description": "Team lunch decision",
    "status": "active",
    "is_public": true,
    "allow_multiple_votes": false,
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z",
    "creator_id": "user-uuid",
    "options": [
      {
        "id": "option-uuid",
        "option_text": "Pizza",
        "display_order": 1,
        "vote_count": 0
      }
    ],
    "total_votes": 0
  }
}
```

### 2. Individual Poll Operations

#### GET /api/polls/[id]
Get a specific poll with all options and vote counts.

**Authentication:** Not required for public polls

**Response:**
```json
{
  "poll": {
    "poll_id": "uuid",
    "question": "What should we have for lunch?",
    "description": "Team lunch decision",
    "status": "active",
    "is_public": true,
    "allow_multiple_votes": false,
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z",
    "creator_id": "user-uuid",
    "options": [
      {
        "id": "option-uuid",
        "option_text": "Pizza",
        "display_order": 1,
        "vote_count": 8
      }
    ],
    "total_votes": 15
  }
}
```

#### PUT /api/polls/[id]
Update a poll (only by the creator).

**Authentication:** Required

**Request Body:**
```json
{
  "question": "Updated question",
  "description": "Updated description",
  "status": "closed",
  "options": ["New Option 1", "New Option 2"]
}
```

**Response:**
```json
{
  "poll": {
    // Updated poll data
  }
}
```

#### DELETE /api/polls/[id]
Delete a poll (only by the creator).

**Authentication:** Required

**Response:**
```json
{
  "message": "Poll deleted successfully"
}
```

### 3. Voting

#### POST /api/polls/[id]/vote
Vote on a poll option.

**Authentication:** Required

**Request Body:**
```json
{
  "optionId": "option-uuid"
}
```

**Response:**
```json
{
  "message": "Vote recorded successfully",
  "poll": {
    // Updated poll with new vote counts
  }
}
```

#### GET /api/polls/[id]/vote
Check if the authenticated user has voted on this poll.

**Authentication:** Required

**Response:**
```json
{
  "hasVoted": true,
  "vote": {
    "option_id": "option-uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 4. Public Polls

#### GET /api/polls/public
Get a list of public active polls (no authentication required).

**Query Parameters:**
- `limit` (optional): Number of polls to return (default: 20)
- `offset` (optional): Number of polls to skip (default: 0)

**Response:**
```json
{
  "polls": [
    {
      "id": "uuid",
      "question": "What should we have for lunch?",
      "description": "Team lunch decision",
      "created_at": "2024-01-01T00:00:00Z",
      "expires_at": "2024-12-31T23:59:59Z",
      "allow_multiple_votes": false,
      "total_votes": 15
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Data Models

### Poll Status
- `active` - Poll is open for voting
- `closed` - Poll is closed and no longer accepting votes
- `draft` - Poll is in draft mode and not visible to voters

### Poll Options
Options are ordered by `display_order` field and maintain consistent ordering.

### Voting Rules
- Users can only vote once per poll (unless `allow_multiple_votes` is true)
- Only active and public polls accept votes
- Votes are validated against poll options

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: Most endpoints require valid user sessions
- **Ownership Validation**: Users can only modify their own polls
- **Input Validation**: All inputs are validated before processing
- **SQL Injection Protection**: Using Supabase client with parameterized queries

## Example Usage

### Creating a Poll
```javascript
const response = await fetch('/api/polls', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'What should we have for lunch?',
    description: 'Team lunch decision',
    options: ['Pizza', 'Sushi', 'Burger'],
    allowMultipleVotes: false,
    isPublic: true
  })
});

const { poll } = await response.json();
```

### Voting on a Poll
```javascript
const response = await fetch(`/api/polls/${pollId}/vote`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    optionId: 'option-uuid'
  })
});

const { poll: updatedPoll } = await response.json();
```

### Getting Public Polls
```javascript
const response = await fetch('/api/polls/public?limit=10&offset=0');
const { polls, pagination } = await response.json();
```

## Error Scenarios

### Common Errors

1. **Unauthorized (401)**
   - User not authenticated
   - Invalid or expired session

2. **Forbidden (403)**
   - User trying to modify another user's poll
   - Poll is not public

3. **Not Found (404)**
   - Poll doesn't exist
   - Invalid poll ID

4. **Bad Request (400)**
   - Missing required fields
   - Invalid data format
   - Poll is not active
   - User already voted

### Error Handling Example
```javascript
try {
  const response = await fetch('/api/polls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pollData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const { poll } = await response.json();
  // Handle success
} catch (error) {
  // Handle error
  console.error('Failed to create poll:', error.message);
}
```

## Next Steps

1. **Real-time Updates**: Consider adding WebSocket support for live poll updates
2. **Analytics**: Add endpoints for poll analytics and reporting
3. **Search**: Implement search and filtering for polls
4. **Categories**: Add poll categorization and tagging
5. **Export**: Add endpoints for exporting poll results

## Support

For API-related issues:
1. Check the error messages in responses
2. Verify authentication status
3. Check request format and required fields
4. Review the database schema and RLS policies
