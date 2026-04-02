package dev;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.mindrot.jbcrypt.BCrypt;

import java.io.*;
import java.nio.file.*;
import java.sql.*;
import java.util.*;
import java.util.regex.*;

/**
 * Standalone database seeder for KarigarNow.
 * Connects directly to PostgreSQL using plain JDBC.
 *
 * Usage:
 *   java dev.DataSeeder --import     seeds all data
 *   java dev.DataSeeder --delete     clears all seeded data
 *   java dev.DataSeeder --reimport   delete then import fresh
 *
 * Compile with:
 *   javac -encoding UTF-8 -cp "lib/*;src/main/resources" dev/DataSeeder.java
 *
 * Run with:
 *   java -cp "lib/*;src/main/resources;." dev.DataSeeder --import
 */
public class DataSeeder {

    private static final Path DATA_DIR;

    static {
        // Resolve dev/data relative to where the project root is (one level up from dev/)
        Path devDir = Paths.get("dev");
        DATA_DIR = devDir.resolve("data");
    }
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");

    private final String dbUrl;
    private final String dbUser;
    private final String dbPassword;
    private final ObjectMapper objectMapper;

    private Connection conn;

    public DataSeeder(String dbUrl, String dbUser, String dbPassword) {
        this.dbUrl = dbUrl;
        this.dbUser = dbUser;
        this.dbPassword = dbPassword;
        this.objectMapper = new ObjectMapper();
    }

    // -------------------------------------------------------------------------
    // Entry Point
    // -------------------------------------------------------------------------

    public static void main(String[] args) {
        if (args.length == 0) {
            printUsage();
            System.exit(1);
        }

        String action = args[0];
        if (!action.equals("--import") && !action.equals("--delete") && !action.equals("--reimport")) {
            printUsage();
            System.exit(1);
        }

        // Load DB config from application.properties
        Properties props = loadAppProperties();
        String dbUrl = props.getProperty("spring.datasource.url");
        String dbUser = props.getProperty("spring.datasource.username");
        String dbPassword = props.getProperty("spring.datasource.password");

        if (dbUrl == null || dbUser == null) {
            System.err.println("ERROR: Could not read database configuration from application.properties");
            System.exit(1);
        }

        DataSeeder seeder = new DataSeeder(dbUrl, dbUser, dbPassword);

        try {
            if (action.equals("--reimport")) {
                System.out.println("=== Reimporting data (delete + import) ===");
                seeder.connect();
                seeder.deleteAll();
                seeder.importAll();
                seeder.disconnect();
            } else if (action.equals("--import")) {
                seeder.connect();
                seeder.importAll();
                seeder.disconnect();
            } else if (action.equals("--delete")) {
                seeder.connect();
                seeder.deleteAll();
                seeder.disconnect();
            }
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void printUsage() {
        System.out.println("Usage: java dev.DataSeeder <flag>");
        System.out.println("  --import     Seed all data into the database");
        System.out.println("  --delete     Delete all seeded data from the database");
        System.out.println("  --reimport   Delete then re-import all data");
    }

    private static Properties loadAppProperties() {
        Properties props = new Properties();
        Path propsPath = Paths.get("src/main/resources/application.properties");
        if (Files.exists(propsPath)) {
            try (InputStream is = Files.newInputStream(propsPath)) {
                props.load(is);
            } catch (IOException e) {
                System.err.println("Warning: Could not read application.properties: " + e.getMessage());
            }
        } else {
            System.err.println("Warning: src/main/resources/application.properties not found");
        }
        return props;
    }

    // -------------------------------------------------------------------------
    // Connection
    // -------------------------------------------------------------------------

    private void connect() throws SQLException {
        conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        conn.setAutoCommit(false);
        System.out.println("Connected to database.");
    }

    private void disconnect() throws SQLException {
        if (conn != null && !conn.isClosed()) {
            conn.commit();
            conn.close();
            System.out.println("Database connection closed.");
        }
    }

    // -------------------------------------------------------------------------
    // Import
    // -------------------------------------------------------------------------

    private void importAll() throws Exception {
        importAppServices();
        importUsers();
        importAddresses();
        importThekedars();
        importThekedarServices();
        importWorkers();
        importReviews();
        conn.commit();
        System.out.println("\n=== All data seeded successfully! ===");
    }

    private void importAppServices() throws Exception {
        JsonNode data = readJson("app_services.json");
        int count = 0;

        // Check if already seeded
        long existing = countRows("app_services");
        if (existing > 0) {
            System.out.println("app_services already has " + existing + " rows — skipping.");
            return;
        }

        String sql = """
            INSERT INTO app_services (slug, name, description, is_active)
            VALUES (?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                ps.setString(1, node.get("slug").asText());
                ps.setString(2, node.get("name").asText());
                ps.setString(3, node.has("description") ? node.get("description").asText() : null);
                ps.setBoolean(4, node.has("is_active") ? node.get("is_active").asBoolean() : true);
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " app_services.");
    }

    private void importUsers() throws Exception {
        JsonNode data = readJson("users.json");

        // Split into consumers and thekedars
        List<JsonNode> consumers = new ArrayList<>();
        List<JsonNode> thekedars = new ArrayList<>();

        for (JsonNode node : data) {
            if ("consumer".equals(node.get("role").asText())) {
                consumers.add(node);
            } else {
                thekedars.add(node);
            }
        }

        insertUsers(consumers, "consumers");
        insertUsers(thekedars, "thekedars");
    }

    private void insertUsers(List<JsonNode> users, String label) throws Exception {
        String sql = """
            INSERT INTO users (name, email, mobile, password, role, active)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        int count = 0;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : users) {
                String hashedPassword = BCrypt.hashpw(node.get("password").asText(), BCrypt.gensalt(12));

                ps.setString(1, node.get("name").asText());
                ps.setString(2, node.get("email").asText());
                ps.setString(3, node.get("mobile").asText());
                ps.setString(4, hashedPassword);
                ps.setString(5, node.get("role").asText());
                ps.setBoolean(6, true);
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " " + label + ".");
    }

    private void importAddresses() throws Exception {
        JsonNode data = readJson("addresses.json");
        int count = 0;

        String sql = """
            INSERT INTO addresses (user_id, address_line1, city, state, postal_code, country, is_primary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID userId = getUserIdByEmail(node.get("consumer_email").asText());

                ps.setObject(1, userId);
                ps.setString(2, node.get("address_line1").asText());
                ps.setString(3, node.get("city").asText());
                ps.setString(4, node.get("state").asText());
                ps.setString(5, node.get("postal_code").asText());
                ps.setString(6, node.has("country") ? node.get("country").asText() : "India");
                ps.setBoolean(7, node.has("is_primary") ? node.get("is_primary").asBoolean() : false);
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " addresses.");
    }

    private void importThekedars() throws Exception {
        JsonNode data = readJson("thekedars.json");
        int count = 0;

        String sql = """
            INSERT INTO thekedars (id, bio, experience, team_size, rate_per_hour, is_online, rating_average, total_jobs, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID userId = getUserIdByEmail(node.get("user_email").asText());

                ps.setObject(1, userId);
                ps.setString(2, node.has("bio") ? node.get("bio").asText() : null);
                ps.setString(3, node.has("experience") ? node.get("experience").asText() : null);
                ps.setInt(4, node.has("team_size") ? node.get("team_size").asInt() : 1);
                ps.setBigDecimal(5, node.has("rate_per_hour") ? new java.math.BigDecimal(node.get("rate_per_hour").asText()) : null);
                ps.setBoolean(6, node.has("is_online") ? node.get("is_online").asBoolean() : false);
                ps.setBigDecimal(7, node.has("rating_average") ? new java.math.BigDecimal(node.get("rating_average").asText()) : new java.math.BigDecimal("0.00"));
                ps.setInt(8, node.has("total_jobs") ? node.get("total_jobs").asInt() : 0);
                ps.setString(9, node.has("location") ? node.get("location").asText() : null);
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " thekedar profiles.");
    }

    private void importThekedarServices() throws Exception {
        JsonNode data = readJson("thekedar_services.json");
        int count = 0;

        String sql = """
            INSERT INTO thekedar_services (thekedar_id, service_id, custom_rate)
            VALUES (?, ?, ?)
            ON CONFLICT (thekedar_id, service_id) DO NOTHING
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID thekedarId = getUserIdByEmail(node.get("thekedar_email").asText());
                UUID serviceId = getServiceIdBySlug(node.get("service_slug").asText());

                ps.setObject(1, thekedarId);
                ps.setObject(2, serviceId);
                ps.setBigDecimal(3, new java.math.BigDecimal(node.get("custom_rate").asText()));
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " thekedar_services entries.");
    }

    private void importWorkers() throws Exception {
        JsonNode data = readJson("workers.json");

        String sql = """
            INSERT INTO workers (thekedar_id, name, mobile, skills, daily_rate, is_available)
            VALUES (?, ?, ?, ?::text[], ?, ?)
            """;

        int totalCount = 0;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID thekedarId = getUserIdByEmail(node.get("thekedar_email").asText());

                ps.setObject(1, thekedarId);
                ps.setString(2, node.get("name").asText());
                ps.setString(3, node.get("mobile").asText());

                // Store skills as PostgreSQL TEXT[] e.g. {"plumbing","tiling"}
                StringBuilder skillsBuilder = new StringBuilder("{");
                JsonNode skillsNode = node.get("skills");
                for (int i = 0; i < skillsNode.size(); i++) {
                    if (i > 0) skillsBuilder.append(",");
                    skillsBuilder.append("\"").append(skillsNode.get(i).asText()).append("\"");
                }
                skillsBuilder.append("}");
                ps.setString(4, skillsBuilder.toString());

                ps.setBigDecimal(5, new java.math.BigDecimal(node.get("daily_rate").asText()));
                ps.setBoolean(6, node.has("is_available") ? node.get("is_available").asBoolean() : true);
                ps.addBatch();
                totalCount++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + totalCount + " workers.");
    }

    private void importReviews() throws Exception {
        JsonNode data = readJson("reviews.json");
        int count = 0;

        String sql = """
            INSERT INTO reviews (consumer_id, thekedar_id, rating, comment)
            VALUES (?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID consumerId = getUserIdByEmail(node.get("consumer_email").asText());
                UUID thekedarId = getUserIdByEmail(node.get("thekedar_email").asText());

                ps.setObject(1, consumerId);
                ps.setObject(2, thekedarId);
                ps.setInt(3, node.get("rating").asInt());
                ps.setString(4, node.get("comment").asText());
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("Inserted " + count + " reviews.");
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    private void deleteAll() throws SQLException {
        // Delete in reverse FK order
        System.out.println("Deleting all seeded data...");

        executeDelete("DELETE FROM reviews");
        System.out.println("  Deleted reviews.");

        executeDelete("DELETE FROM booking_workers");
        System.out.println("  Deleted booking_workers.");

        executeDelete("DELETE FROM workers");
        System.out.println("  Deleted workers.");

        executeDelete("DELETE FROM thekedar_services");
        System.out.println("  Deleted thekedar_services.");

        executeDelete("DELETE FROM thekedars");
        System.out.println("  Deleted thekedars.");

        executeDelete("DELETE FROM addresses");
        System.out.println("  Deleted addresses.");

        // Don't delete users as it may break other data — just truncate if needed
        // Keeping users for auth integrity. If you want to nuke everything:
        // executeDelete("DELETE FROM users");

        conn.commit();
        System.out.println("All data cleared.");
    }

    private void executeDelete(String sql) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(sql);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private JsonNode readJson(String filename) throws Exception {
        Path filePath = DATA_DIR.resolve(filename);
        if (!Files.exists(filePath)) {
            throw new FileNotFoundException("Data file not found: " + filePath.toAbsolutePath());
        }
        return objectMapper.readTree(Files.readString(filePath));
    }

    private UUID getUserIdByEmail(String email) throws SQLException {
        String sql = "SELECT id FROM users WHERE email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getObject("id", UUID.class);
                }
            }
        }
        throw new SQLException("User not found for email: " + email);
    }

    private UUID getServiceIdBySlug(String slug) throws SQLException {
        String sql = "SELECT id FROM app_services WHERE slug = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, slug);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getObject("id", UUID.class);
                }
            }
        }
        throw new SQLException("Service not found for slug: " + slug);
    }

    private long countRows(String table) throws SQLException {
        String sql = "SELECT COUNT(*) FROM " + table;
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        }
        return 0;
    }}
