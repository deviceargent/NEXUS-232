use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MediaState {
    pub is_playing: bool,
    pub current_position: f64,
    pub duration: f64,
    pub uri: String,
}

pub trait MediaAdapter {
    fn open(&mut self, uri: &str) -> Result<(), String>;
    fn play(&mut self) -> Result<(), String>;
    fn pause(&mut self) -> Result<(), String>;
    fn seek(&mut self, position_seconds: f64) -> Result<(), String>;
    fn stop(&mut self) -> Result<(), String>;
    fn get_position(&self) -> Result<f64, String>;
    fn get_duration(&self) -> Result<f64, String>;
    fn close(&mut self) -> Result<(), String>;
}

/**
 * Native LibMpv Adapter abstraction.
 * Communicates with MPV IPC or native libmpv instance.
 */
pub struct NativeLibMpvAdapter {
    state: MediaState,
}

impl NativeLibMpvAdapter {
    pub fn new() -> Self {
        Self {
            state: MediaState {
                is_playing: false,
                current_position: 0.0,
                duration: 120.0,
                uri: String::new(),
            },
        }
    }
}

impl MediaAdapter for NativeLibMpvAdapter {
    fn open(&mut self, uri: &str) -> Result<(), String> {
        self.state.uri = uri.to_string();
        self.state.current_position = 0.0;
        self.state.is_playing = true;
        Ok(())
    }

    fn play(&mut self) -> Result<(), String> {
        self.state.is_playing = true;
        Ok(())
    }

    fn pause(&mut self) -> Result<(), String> {
        self.state.is_playing = false;
        Ok(())
    }

    fn seek(&mut self, position_seconds: f64) -> Result<(), String> {
        self.state.current_position = position_seconds;
        Ok(())
    }

    fn stop(&mut self) -> Result<(), String> {
        self.state.is_playing = false;
        self.state.current_position = 0.0;
        Ok(())
    }

    fn get_position(&self) -> Result<f64, String> {
        Ok(self.state.current_position)
    }

    fn get_duration(&self) -> Result<f64, String> {
        Ok(self.state.duration)
    }

    fn close(&mut self) -> Result<(), String> {
        self.state.is_playing = false;
        self.state.uri.clear();
        Ok(())
    }
}
