-- Supports calendar date-range scans and chronological event ordering.
-- For the legacy zero-date schema, use SET SESSION sql_mode = ''; if needed.
CREATE INDEX idx_openhouse_date_time_id
ON rets_openhouse (OpenHouseDate, OH_StartTime, id);
