CREATE INDEX idx_site_date ON enveloped_fft (site, meas_date); 
CREATE INDEX idx_site_state_id ON enveloped_fft (site, state, id);
CREATE INDEX idx_dashboard_optimized ON enveloped_fft (site, equipment, meas_date, state, indicator, id);
CREATE INDEX idx_site_equipment_id ON enveloped_fft (site, equipment, id);