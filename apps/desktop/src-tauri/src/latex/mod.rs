use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::Instant;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompilerInfo {
    pub engine: String,
    pub path: String,
    pub version: String,
    pub is_available: bool,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CompilationResult {
    pub success: bool,
    pub pdf_path: Option<String>,
    pub log_output: String,
    pub duration_ms: u64,
}

pub struct LatexCompilerService;

impl LatexCompilerService {
    pub fn detect_compilers() -> Vec<CompilerInfo> {
        let engines = vec!["pdflatex", "xelatex", "lualatex", "tectonic"];
        let mut results = Vec::new();

        for engine in engines {
            let output = Command::new(engine).arg("--version").output();

            match output {
                Ok(out) if out.status.success() => {
                    let version_text = String::from_utf8_lossy(&out.stdout)
                        .lines()
                        .next()
                        .unwrap_or("")
                        .to_string();

                    results.push(CompilerInfo {
                        engine: engine.to_string(),
                        path: engine.to_string(),
                        version: version_text,
                        is_available: true,
                        status: "READY".to_string(),
                    });
                }
                _ => {
                    results.push(CompilerInfo {
                        engine: engine.to_string(),
                        path: engine.to_string(),
                        version: "".to_string(),
                        is_available: false,
                        status: "NOT_INSTALLED".to_string(),
                    });
                }
            }
        }

        results
    }

    pub fn compile_latex(
        document_id: &str,
        latex_content: &str,
        engine: &str,
    ) -> Result<CompilationResult, String> {
        let start = Instant::now();
        let temp_dir = std::env::temp_dir().join("nexus_latex").join(document_id);
        fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;

        let tex_file = temp_dir.join("main.tex");
        fs::write(&tex_file, latex_content).map_err(|e| e.to_string())?;

        let output = Command::new(engine)
            .current_dir(&temp_dir)
            .arg("-interaction=nonstopmode")
            .arg("main.tex")
            .output()
            .map_err(|e| format!("Failed to spawn {}: {}", engine, e))?;

        let duration_ms = start.elapsed().as_millis() as u64;
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        let log_output = format!("{}\n{}", stdout, stderr);

        let pdf_file = temp_dir.join("main.pdf");
        let success = pdf_file.exists();

        Ok(CompilationResult {
            success,
            pdf_path: if success {
                Some(pdf_file.to_string_lossy().to_string())
            } else {
                None
            },
            log_output,
            duration_ms,
        })
    }
}
