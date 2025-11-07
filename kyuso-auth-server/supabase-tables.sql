-- Run these SQL commands in your Supabase SQL Editor to create the required tables

-- OAuth Clients table
CREATE TABLE oauth_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Authorization Codes table  
CREATE TABLE oauth_auth_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Refresh Tokens table
CREATE TABLE oauth_refresh_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  client_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_oauth_clients_client_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_auth_codes_code ON oauth_auth_codes(code);
CREATE INDEX idx_oauth_auth_codes_user_id ON oauth_auth_codes(user_id);
CREATE INDEX idx_oauth_refresh_tokens_token ON oauth_refresh_tokens(token);
CREATE INDEX idx_oauth_refresh_tokens_user_id ON oauth_refresh_tokens(user_id);