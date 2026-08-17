# Week 9 query performance

Run the statements in `week9_performance_indexes.sql`, then compare `EXPLAIN` before and after for a representative city and price range:

```sql
EXPLAIN SELECT * FROM rets_property
WHERE L_City = 'Los Angeles'
  AND L_SystemPrice BETWEEN 500000 AND 1500000
ORDER BY L_SystemPrice ASC, id ASC
LIMIT 20 OFFSET 0;
```

Use direct equality because wrapping `L_City` in `LOWER(TRIM(...))` prevents MySQL from using a normal index efficiently. The API trims incoming city values and typical case-insensitive MySQL collations already compare text without regard to case.

## EXPLAIN columns

- `id`: order of the SELECT operation.
- `select_type`: query type; this query should be `SIMPLE`.
- `table`: table accessed by the step.
- `partitions`: selected table partitions, if any.
- `type`: access method. `range` or `ref` is preferable to a full `ALL` scan.
- `possible_keys`: indexes MySQL could use.
- `key`: index actually selected.
- `key_len`: number of index bytes used.
- `ref`: columns/constants compared with the index.
- `rows`: estimated rows MySQL must inspect; lower is generally better.
- `filtered`: estimated percentage surviving the condition.
- `Extra`: additional work. Avoid `Using filesort` and large temporary tables where practical.

Record the before/after `key`, `type`, `rows`, `Extra`, and measured execution time. Expected result: `idx_property_city_price_id` changes a broad table scan toward an indexed range scan and lets MySQL read rows in price order. Exact values depend on the imported dataset and its statistics.

## Measurement from the development database

| Measurement | Before | After |
| --- | --- | --- |
| selected index | `idx_L_City` | `idx_property_city_price_id` |
| access type | `ref` | `range` |
| estimated rows | 3,444 | 1,881 |
| filtered | 11.11% | 100% |
| Extra | `Using where; Using filesort` | `Using index condition` |
| post-index query time | — | 6.678 ms for 20 rows |

The composite index reduced estimated row reads by about 45.4% and eliminated the explicit filesort. The exact runtime before indexing was not retained, so the plan comparison is the reproducible performance evidence; future measurements should warm the buffer pool and average multiple runs.
