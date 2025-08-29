# Database Setup for ALX Polly

This document explains how to set up the database schema for the ALX Polly polling application.

## Overview

The database schema consists of four main tables:
- **profiles**: Extended user information (extends Supabase auth.users)
- **polls**: Main poll data with questions and settings
- **poll_options**: Individual options for each poll
- **votes**: User votes on poll options

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute the schema

### 3. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your authentication providers (Google, GitHub, etc.)
3. Set up email templates if using email authentication

## Database Schema Details

### Tables

#### profiles
- Extends Supabase's built-in `auth.users` table
- Stores additional user information like full name and avatar
- Automatically linked to authenticated users

#### polls
- Core poll information (question, description, status)
- Supports public/private polls
- Can be set to expire at a specific time
- Supports multiple voting modes

#### poll_options
- Individual options for each poll
- Maintains display order for consistent UI
- Automatically deleted when parent poll is deleted

#### votes
- Records individual user votes
- Prevents duplicate votes (unless multiple voting is enabled)
- Links to both poll and specific option

### Features

- **Row Level Security (RLS)**: Ensures users can only access appropriate data
- **Automatic timestamps**: Created/updated timestamps are automatically managed
- **Cascading deletes**: Deleting a poll removes all related options and votes
- **Performance indexes**: Optimized for common query patterns
- **Helper functions**: Built-in functions for common operations

### Helper Functions

#### `get_poll_with_options(poll_uuid)`
Returns a complete poll with all options and vote counts in a single query.

#### `get_user_polls(user_uuid)`
Returns all polls created by a specific user with vote counts.

#### `record_vote(poll_uuid, option_uuid, voter_uuid)`
Safely records a vote with validation checks.

## Usage Examples

### Creating a Poll
```sql
-- Insert poll
INSERT INTO polls (creator_id, question, description) 
VALUES ('user-uuid', 'What should we have for lunch?', 'Team lunch decision');

-- Insert options
INSERT INTO poll_options (poll_id, option_text, display_order) VALUES
  ('poll-uuid', 'Pizza', 1),
  ('poll-uuid', 'Sushi', 2),
  ('poll-uuid', 'Burger', 3);
```

### Recording a Vote
```sql
-- Use the helper function
SELECT record_vote('poll-uuid', 'option-uuid', 'voter-uuid');
```

### Getting Poll Results
```sql
-- Use the helper function
SELECT * FROM get_poll_with_options('poll-uuid');
```

## Security Features

- **Authentication required**: All operations require valid user authentication
- **Data isolation**: Users can only access their own data and public polls
- **Vote validation**: Prevents duplicate votes and invalid voting
- **Poll ownership**: Only poll creators can modify their polls

## Performance Considerations

- Indexes on frequently queried columns
- JSON aggregation for efficient poll data retrieval
- Optimized queries using helper functions
- Proper foreign key relationships for data integrity

## Troubleshooting

### Common Issues

1. **Permission denied errors**: Ensure RLS policies are properly configured
2. **Foreign key violations**: Check that referenced records exist
3. **Authentication issues**: Verify Supabase client configuration

### Debugging

- Check Supabase logs in the dashboard
- Verify RLS policies are enabled
- Test queries in the SQL editor with proper authentication

## Next Steps

After setting up the database:

1. Update your API routes to use the new schema
2. Implement proper error handling for database operations
3. Add real-time subscriptions for live poll updates
4. Consider adding analytics and reporting features

## Support

For database-related issues:
1. Check Supabase documentation
2. Review the SQL schema for syntax errors
3. Verify environment variables are correctly set
4. Test in Supabase SQL editor first
