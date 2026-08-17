-- Week 9: composite indexes for the common city/price and bedroom/bath/price filters.
-- Run each statement once. Verify existing indexes first with SHOW INDEX FROM rets_property.
-- The imported legacy table has a zero-date timestamp default. If strict mode rejects
-- ALTER TABLE with ER_INVALID_DEFAULT, run this file in a session with:
-- SET SESSION sql_mode = '';
CREATE INDEX idx_property_city_price_id
ON rets_property (L_City, L_SystemPrice, id);

CREATE INDEX idx_property_beds_baths_price_id
ON rets_property (L_Keyword2, LM_Dec_3, L_SystemPrice, id);

CREATE INDEX idx_property_list_date_id
ON rets_property (ListingContractDate, id);
