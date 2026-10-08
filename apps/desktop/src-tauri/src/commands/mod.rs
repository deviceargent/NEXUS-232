use crate::database::DatabaseManager;
use crate::latex::{CompilationResult, CompilerInfo, LatexCompilerService};
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub db: Mutex<Option<DatabaseManager>>,
}

#[tauri::command]
pub fn detect_compilers() -> Vec<CompilerInfo> {
    LatexCompilerService::detect_compilers()
}

#[tauri::command]
pub fn compile_latex(
    document_id: String,
    latex_content: String,
    engine: String,
) -> Result<CompilationResult, String> {
    LatexCompilerService::compile_latex(&document_id, &latex_content, &engine)
}

#[tauri::command]
pub fn save_project_bundle(
    state: State<'_, AppState>,
    project_id: String,
    name: String,
    description: String,
    settings_json: String,
    layout_json: String,
) -> Result<(), String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(db) = db_guard.as_ref() {
        let now = chrono::Utc::now().to_rfc3339();
        db.save_project(
            &project_id,
            &name,
            &description,
            &settings_json,
            &layout_json,
            &now,
            &now,
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn load_project_bundle(
    state: State<'_, AppState>,
    project_id: String,
) -> Result<serde_json::Value, String> {
    let db_guard = state.db.lock().map_err(|e| e.to_string())?;
    if let Some(db) = db_guard.as_ref() {
        db.load_project_bundle(&project_id).map_err(|e| e.to_string())
    } else {
        Err("Database not initialized".to_string())
    }
}
