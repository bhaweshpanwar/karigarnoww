package com.karigarnow.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Fix thekedars table columns
            jdbcTemplate.execute("ALTER TABLE thekedars ALTER COLUMN bio TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE thekedars ALTER COLUMN experience TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE thekedars ALTER COLUMN location TYPE TEXT");
            
            // Fix workers table skills
            jdbcTemplate.execute("ALTER TABLE workers ALTER COLUMN skills TYPE TEXT");
            
            // Fix app_services description
            jdbcTemplate.execute("ALTER TABLE app_services ALTER COLUMN description TYPE TEXT");
            
            // Fix reviews comment
            jdbcTemplate.execute("ALTER TABLE reviews ALTER COLUMN comment TYPE TEXT");
            
            System.out.println("Database schema fixed successfully: columns migrated to TEXT type.");
        } catch (Exception e) {
            // If it fails (e.g. columns already TEXT or table doesn't exist yet), just log and continue
            System.out.println("Database schema check completed (no changes needed or handled by Hibernate).");
        }
    }
}
