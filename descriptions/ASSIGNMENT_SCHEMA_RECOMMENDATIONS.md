# Secret Santa Assignment Schema Recommendations

## Current Schema Analysis

### Existing Tables (Good)
```sql
-- participants table has assigned_to
participants.assigned_to BIGINT UNSIGNED NULL

-- assignments table for audit
assignments (id, party_id, giver_id, receiver_id, created_at)
```

### Recommended Additions

```sql
-- Add exclusions table for custom restrictions
CREATE TABLE IF NOT EXISTS participant_exclusions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  party_id CHAR(36) NOT NULL,
  participant_id BIGINT UNSIGNED NOT NULL,
  excluded_participant_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (excluded_participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_exclusion (party_id, participant_id, excluded_participant_id),
  INDEX idx_party_exclusions (party_id),
  INDEX idx_participant (participant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add previous_assignments for historical tracking (prevent same pairs)
CREATE TABLE IF NOT EXISTS previous_assignments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  party_id CHAR(36) NOT NULL,
  year INT NOT NULL,
  giver_id BIGINT UNSIGNED NOT NULL,
  receiver_id BIGINT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_previous_assignment (party_id, year, giver_id),
  INDEX idx_party_year (party_id, year),
  INDEX idx_giver (giver_id),
  INDEX idx_receiver (receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add assignment_metadata for tracking generation attempts
CREATE TABLE IF NOT EXISTS assignment_metadata (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  party_id CHAR(36) NOT NULL UNIQUE,
  generation_attempts INT NOT NULL DEFAULT 0,
  last_generated_at TIMESTAMP NULL,
  generated_by BIGINT UNSIGNED NULL,
  algorithm_used VARCHAR(50) DEFAULT 'cycle',
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_party (party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Schema Improvements

### 1. Composite Indexes for Performance
```sql
ALTER TABLE assignments ADD INDEX idx_party_giver (party_id, giver_id);
ALTER TABLE assignments ADD INDEX idx_party_receiver (party_id, receiver_id);
```

### 2. Check Constraints (MySQL 8.0+)
```sql
ALTER TABLE participants 
ADD CONSTRAINT chk_no_self_assignment 
CHECK (assigned_to IS NULL OR assigned_to != id);
```

### 3. Soft Delete Support (Optional)
```sql
ALTER TABLE assignments ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE assignments ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

