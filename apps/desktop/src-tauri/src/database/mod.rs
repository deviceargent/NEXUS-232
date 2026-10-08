pub mod schema;

use rusqlite::{params, Connection, Result};
use std::path::Path;

pub struct DatabaseManager {
    db_path: String,
}

impl DatabaseManager {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path_str = path.as_ref().to_string_lossy().to_string();
        let conn = Connection::open(&path_str)?;
        schema::initialize_database(&conn)?;
        Ok(Self { db_path: path_str })
    }

    pub fn get_connection(&self) -> Result<Connection> {
        Connection::open(&self.db_path)
    }

    pub fn save_project(
        &self,
        id: &str,
        name: &str,
        description: &str,
        settings_json: &str,
        layout_json: &str,
        created_at: &str,
        updated_at: &str,
    ) -> Result<()> {
        let conn = self.get_connection()?;
        conn.execute(
            r#"
            INSERT INTO projects (id, name, description, settings_json, layout_json, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                description = excluded.description,
                settings_json = excluded.settings_json,
                layout_json = excluded.layout_json,
                updated_at = excluded.updated_at
            "#,
            params![id, name, description, settings_json, layout_json, created_at, updated_at],
        )?;
        Ok(())
    }

    pub fn load_project_bundle(&self, project_id: &str) -> Result<serde_json::Value> {
        let conn = self.get_connection()?;

        let mut project_stmt = conn.prepare(
            "SELECT id, name, description, settings_json, layout_json, created_at, updated_at FROM projects WHERE id = ?1"
        )?;

        let project_row = project_stmt.query_row(params![project_id], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "name": row.get::<_, String>(1)?,
                "description": row.get::<_, String>(2)?,
                "settings": serde_json::from_str::<serde_json::Value>(&row.get::<_, String>(3)?).unwrap_or(serde_json::json!({})),
                "layout": serde_json::from_str::<serde_json::Value>(&row.get::<_, String>(4)?).unwrap_or(serde_json::json!({})),
                "createdAt": row.get::<_, String>(5)?,
                "updatedAt": row.get::<_, String>(6)?,
            }))
        })?;

        // Query nodes
        let mut node_stmt = conn.prepare(
            "SELECT id, alias, type, title, content, status, is_frozen, metadata_json, created_at, updated_at FROM theory_nodes WHERE project_id = ?1"
        )?;
        let nodes = node_stmt.query_map(params![project_id], |row| {
            let meta_str: String = row.get(7)?;
            let meta: serde_json::Value = serde_json::from_str(&meta_str).unwrap_or(serde_json::json!({}));
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "alias": row.get::<_, String>(1)?,
                "type": row.get::<_, String>(2)?,
                "title": row.get::<_, String>(3)?,
                "content": row.get::<_, String>(4)?,
                "status": row.get::<_, String>(5)?,
                "isFrozen": row.get::<_, i64>(6)? != 0,
                "metadata": meta,
                "createdAt": row.get::<_, String>(8)?,
                "updatedAt": row.get::<_, String>(9)?,
                "parentIds": [],
                "dependencyIds": [],
                "resourceIds": [],
                "documentFragmentIds": []
            }))
        })?.collect::<Result<Vec<_>>>()?;

        // Query edges
        let mut edge_stmt = conn.prepare(
            "SELECT id, source_id, target_id, relation_type, label, metadata_json, created_at FROM theory_edges WHERE project_id = ?1"
        )?;
        let edges = edge_stmt.query_map(params![project_id], |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "sourceId": row.get::<_, String>(1)?,
                "targetId": row.get::<_, String>(2)?,
                "relationType": row.get::<_, String>(3)?,
                "label": row.get::<_, Option<String>>(4)?,
                "createdAt": row.get::<_, String>(6)?
            }))
        })?.collect::<Result<Vec<_>>>()?;

        Ok(serde_json::json!({
            "project": project_row,
            "nodes": nodes,
            "edges": edges,
            "resources": [],
            "documents": [],
            "compilations": [],
            "messages": [],
            "actions": []
        }))
    }
}
