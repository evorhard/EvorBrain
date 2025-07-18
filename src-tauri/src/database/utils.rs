/// Database utility functions for type conversions
use chrono::{DateTime, Utc, NaiveDateTime, NaiveDate};

/// Convert Option<NaiveDateTime> to DateTime<Utc>
pub fn to_datetime_utc(naive: Option<NaiveDateTime>) -> DateTime<Utc> {
    match naive {
        Some(dt) => DateTime::from_naive_utc_and_offset(dt, Utc),
        None => Utc::now(),
    }
}

/// Convert Option<NaiveDate> to Option<DateTime<Utc>>
pub fn to_datetime_utc_opt(naive: Option<NaiveDate>) -> Option<DateTime<Utc>> {
    naive.map(|d| DateTime::from_naive_utc_and_offset(d.and_hms_opt(0, 0, 0).unwrap(), Utc))
}

/// Convert DateTime<Utc> to NaiveDateTime for SQLite storage
pub fn to_naive_datetime(dt: DateTime<Utc>) -> NaiveDateTime {
    dt.naive_utc()
}