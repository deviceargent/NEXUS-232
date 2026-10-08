pub mod commands;
pub mod database;
pub mod latex;
pub mod media;

use commands::AppState;
use database::DatabaseManager;
use std::sync::Mutex;
use tauri::Manager;

pub fn run() {
    let app_state = AppState {
        db: Mutex::new(None),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().unwrap_or_else(|_| {
                std::env::current_dir().unwrap_or_default()
            });
            std::fs::create_dir_all(&app_data_dir).ok();
            let db_path = app_data_dir.join("nexus_workspace.db");

            if let Ok(db) = DatabaseManager::new(&db_path) {
                let state: tauri::State<AppState> = app.state();
                if let Ok(mut db_guard) = state.db.lock() {
                    *db_guard = Some(db);
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::detect_compilers,
            commands::compile_latex,
            commands::save_project_bundle,
            commands::load_project_bundle,
        ])
        .run(tauri::generate_context!())
        .expect("error while running nexus tauri application");
}
