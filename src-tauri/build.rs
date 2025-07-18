fn main() {
    // Set DATABASE_URL for SQLx compile-time verification
    // This is only used during compilation, the actual database path is determined at runtime
    println!("cargo:rustc-env=DATABASE_URL=sqlite:./data/evorbrain.db");
    
    tauri_build::build()
}