# Vibration Dashboard 

### Instructions:
- This project use pnpm as package manager tool.
```bash
pnpm install
```
```bash
pnpm run start:dev
```

### Setup Guide:
1. Copy file `.env.example` and rename as `.env`
```bash
cp .env.example .env
```
There're 2 .env files that must considered
- In frontend directory change VITE_API_URL to your domain
```bash 
VITE_API_URL=http://<YOUR_SERVER_IP>/api 
```
- In backend directory replace `localhost` with that server's actual IP address or domain name.
```bash
DB_HOST=<YOUR_SERVER_IP> 
REDIS_URL=redis://<YOUR_SERVER_IP>:6379
```

2. Start Container (using Docker)
```bash
docker-compose up -d 
```
On the first run, MySQL will automatically create the database and indexes from the init-scripts folder.

3. Start Backend (NestJS)
```bash
cd backend
pnpm install
pnpm run start:dev
```
4. Synchronize data with TypeSense (only need to do this the first time or when the data in the database changes).
```bash
Request POST http://localhost:3000/api/v1/equipments/sync-typesense
```
5. Start Frontend 
```bash
cd frontend
pnpm install
pnpm run dev
```

### Documentation
link: https://docs.google.com/document/d/1lVkGfwZHhRAmN0BB3ImxGZIcdeU1RoG2Kf2WnSS0UGg/edit?usp=sharing

### Database Setup
1. Create ‘reports’ table
```bash
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enveloped_fft_id BIGINT UNSIGNED NOT NULL UNIQUE, 
    kks VARCHAR(100),
    equipment_name VARCHAR(255),
    rpm FLOAT,
    bearings JSON,
    findings TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
2. Create ‘equipment’ table use in dashboard query (stat + overdue)
```bash
CREATE TABLE `equipment` (
  `site` varchar(50) NOT NULL,
  `equipment` varchar(255) NOT NULL,
  `meas_id` int NOT NULL,
  `meas_point` varchar(100) DEFAULT NULL,
  `meas_date` date NOT NULL,
  `meas_time` time DEFAULT NULL,
  `state` tinyint(1) DEFAULT NULL,
  `is_f_motor` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP 
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`site`, `equipment`),
  KEY `idx_site_state` (`site`, `state`),
  KEY `idx_meas_date` (`meas_date`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
```
3. Insert Data 
```bash
INSERT INTO equipment (site, equipment, meas_id, meas_point, meas_date, meas_time, state, is_f_motor)
SELECT
  ef.site, ef.equipment, ef.id,
  ef.meas_point, ef.meas_date, ef.meas_time, ef.state,
  CASE
    WHEN ef.state = 6
     AND ef.detail_peak IS NOT NULL AND ef.detail_peak != ''
     AND FLOOR(JSON_EXTRACT(ef.enveloped_fft,
           CONCAT('$[', SUBSTRING_INDEX(ef.detail_peak, ',', 1), '][0]'))) = 100
    THEN 1 ELSE 0
  END AS is_f_motor
FROM enveloped_fft ef
INNER JOIN (
  SELECT id
  FROM (
    SELECT id,
      ROW_NUMBER() OVER(
        PARTITION BY site, equipment
        ORDER BY meas_date DESC, meas_time DESC, state DESC, id DESC
      ) AS rn
    FROM enveloped_fft
    WHERE state IS NOT NULL
      AND (indicator IS NULL OR indicator != 'I')
  ) ranked
  WHERE rn = 1
) latest ON ef.id = latest.id
ON DUPLICATE KEY UPDATE
  meas_id    = VALUES(meas_id),
  meas_point = VALUES(meas_point),
  meas_date  = VALUES(meas_date),
  meas_time  = VALUES(meas_time),
  state      = VALUES(state),
  is_f_motor = VALUES(is_f_motor),
  updated_at = NOW();
```
4. Create trigger
```bash
CREATE DEFINER=`root`@`%` TRIGGER `trg_equipment_upsert` AFTER INSERT ON `enveloped_fft` FOR EACH ROW BEGIN
  DECLARE v_is_f_motor TINYINT DEFAULT 0;
  IF NEW.state IS NOT NULL AND (NEW.indicator IS NULL OR NEW.indicator != 'I') THEN
    IF NEW.state = 6 AND NEW.detail_peak IS NOT NULL AND NEW.detail_peak != '' AND FLOOR(JSON_EXTRACT(NEW.enveloped_fft, CONCAT('$[', SUBSTRING_INDEX(NEW.detail_peak, ',', 1), '][0]'))) = 100 THEN
      SET v_is_f_motor = 1;
    END IF;
    INSERT IGNORE INTO equipment (site, equipment, meas_id, meas_point, meas_date, meas_time, state, is_f_motor) VALUES (NEW.site, NEW.equipment, NEW.id, NEW.meas_point, NEW.meas_date, NEW.meas_time, NEW.state, v_is_f_motor);
    IF ROW_COUNT() = 0 THEN
      UPDATE equipment SET meas_id = NEW.id, meas_point = NEW.meas_point, meas_date = NEW.meas_date, meas_time = NEW.meas_time, state = NEW.state, is_f_motor = v_is_f_motor, updated_at = NOW() WHERE site = NEW.site AND equipment = NEW.equipment AND (NEW.meas_date > meas_date OR (NEW.meas_date = meas_date AND NEW.meas_time > meas_time) OR (NEW.meas_date = meas_date AND NEW.meas_time = meas_time AND NEW.state > state));
    END IF;
  END IF;
END
```
