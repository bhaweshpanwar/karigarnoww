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
 *   java dev.DataSeeder --clean      clears all seeded data
 *   java dev.DataSeeder --reimport   clean then import fresh
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
        if (!action.equals("--import") && !action.equals("--clean") && !action.equals("--reimport")) {
            printUsage();
            System.exit(1);
        }

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
                System.out.println("=== Reimporting data (clean + import) ===");
                seeder.connect();
                seeder.cleanDatabase();
                seeder.importAll();
                seeder.disconnect();
            } else if (action.equals("--import")) {
                seeder.connect();
                seeder.importAll();
                seeder.disconnect();
            } else if (action.equals("--clean")) {
                seeder.connect();
                seeder.cleanDatabase();
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
        System.out.println("  --clean      Delete all seeded data from the database");
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
        importUsers();
        importAddresses();
        linkAddressesToUsers();
        importThekedars();
        importThekedarServices();
        importWorkers();
        importBookings();
        importBookingWorkers();
        importEarnings();
        importReviews();
        conn.commit();
        System.out.println("\n=== All data seeded successfully! ===");
    }

    private void importUsers() throws Exception {
        JsonNode data = readJson("users.json");

        List<JsonNode> consumers = new ArrayList<>();
        List<JsonNode> thekedars = new ArrayList<>();

        for (JsonNode node : data) {
            if ("consumer".equals(node.get("role").asText())) {
                consumers.add(node);
            } else {
                thekedars.add(node);
            }
        }

        int consumerCount = insertUsers(consumers, "consumer");
        int thekedarCount = insertUsers(thekedars, "thekedar");
        System.out.println("✓ Users inserted (" + consumerCount + " consumers, " + thekedarCount + " thekedars)");
    }

    private int insertUsers(List<JsonNode> users, String role) throws Exception {
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

        return count;
    }

    private void importAddresses() throws Exception {
        JsonNode data = readJson("addresses.json");
        int count = 0;

        String sql = """
            INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country, is_primary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID userId = getUserIdByEmail(node.get("userEmail").asText());

                ps.setObject(1, userId);
                ps.setString(2, node.get("address_line1").asText());
                ps.setString(3, node.has("address_line2") ? node.get("address_line2").asText() : null);
                ps.setString(4, node.get("city").asText());
                ps.setString(5, node.get("state").asText());
                ps.setString(6, node.get("postal_code").asText());
                ps.setString(7, node.has("country") ? node.get("country").asText() : "India");
                ps.setBoolean(8, node.has("is_primary") ? node.get("is_primary").asBoolean() : false);
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Addresses inserted (" + count + " records)");
    }

    private void linkAddressesToUsers() throws SQLException {
        String sql = """
            UPDATE users u SET address_id = a.id
            FROM addresses a WHERE a.user_id = u.id
            """;
        try (Statement stmt = conn.createStatement()) {
            stmt.executeUpdate(sql);
        }
        System.out.println("✓ Addresses linked to users");
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
                UUID userId = getUserIdByEmail(node.get("userEmail").asText());

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

        System.out.println("✓ Thekedars inserted (" + count + " records)");
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
                UUID thekedarId = getUserIdByEmail(node.get("thekedarEmail").asText());
                UUID serviceId = getServiceIdBySlug(node.get("serviceSlug").asText());

                ps.setObject(1, thekedarId);
                ps.setObject(2, serviceId);
                ps.setBigDecimal(3, new java.math.BigDecimal(node.get("custom_rate").asText()));
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Thekedar services inserted (" + count + " records)");
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
                UUID thekedarId = getUserIdByEmail(node.get("thekedarEmail").asText());

                ps.setObject(1, thekedarId);
                ps.setString(2, node.get("name").asText());
                ps.setString(3, node.get("mobile").asText());

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

        System.out.println("✓ Workers inserted (" + totalCount + " total)");
    }

    private void importBookings() throws Exception {
        JsonNode data = readJson("bookings.json");
        int count = 0;

        String sql = """
            INSERT INTO bookings (consumer_id, thekedar_id, service_id, workers_needed, address_id, scheduled_at, total_amount, platform_fee, thekedar_payout, otp, otp_verified, booking_status, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID consumerId = getUserIdByEmail(node.get("consumerEmail").asText());
                UUID thekedarId = getUserIdByEmail(node.get("thekedarEmail").asText());
                UUID serviceId = getServiceIdBySlug(node.get("serviceSlug").asText());
                UUID addressId = getAddressIdByEmail(node.get("consumerEmail").asText());

                ps.setObject(1, consumerId);
                ps.setObject(2, thekedarId);
                ps.setObject(3, serviceId);
                ps.setInt(4, node.get("workers_needed").asInt());
                ps.setObject(5, addressId);

                if (node.has("scheduled_at") && !node.get("scheduled_at").isNull()) {
                    ps.setTimestamp(6, Timestamp.valueOf(node.get("scheduled_at").asText().replace("T", " ")));
                } else {
                    ps.setNull(6, Types.TIMESTAMP);
                }

                ps.setBigDecimal(7, new java.math.BigDecimal(node.get("total_amount").asText()));
                ps.setBigDecimal(8, new java.math.BigDecimal(node.get("platform_fee").asText()));
                ps.setBigDecimal(9, new java.math.BigDecimal(node.get("thekedar_payout").asText()));

                if (node.has("otp") && !node.get("otp").isNull()) {
                    ps.setString(10, node.get("otp").asText());
                } else {
                    ps.setNull(10, Types.VARCHAR);
                }

                ps.setBoolean(11, node.has("otp_verified") && node.get("otp_verified").asBoolean());
                ps.setString(12, node.get("booking_status").asText());
                ps.setString(13, node.get("payment_status").asText());
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Bookings inserted (" + count + " total)");
    }

    private void importBookingWorkers() throws Exception {
        JsonNode data = readJson("booking_workers.json");
        int count = 0;

        String sql = """
            INSERT INTO booking_workers (booking_id, worker_id, assigned_at)
            VALUES (?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                String bookingRef = node.get("bookingRef").asText();
                String workerMobile = node.get("workerMobile").asText();

                UUID bookingId = getBookingIdByRef(bookingRef);
                UUID workerId = getWorkerIdByMobile(workerMobile);

                ps.setObject(1, bookingId);
                ps.setObject(2, workerId);
                ps.setTimestamp(3, new Timestamp(System.currentTimeMillis()));
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Booking workers inserted (" + count + " records)");
    }

    private void importEarnings() throws Exception {
        JsonNode data = readJson("earnings.json");
        int count = 0;

        String sql = """
            INSERT INTO earnings (thekedar_id, booking_id, amount, platform_fee, net_amount, paid_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                UUID thekedarId = getUserIdByEmail(node.get("thekedarEmail").asText());
                String bookingRef = node.get("bookingRef").asText();
                UUID bookingId = getBookingIdByRef(bookingRef);

                ps.setObject(1, thekedarId);
                ps.setObject(2, bookingId);
                ps.setBigDecimal(3, new java.math.BigDecimal(node.get("amount").asText()));
                ps.setBigDecimal(4, new java.math.BigDecimal(node.get("platform_fee").asText()));
                ps.setBigDecimal(5, new java.math.BigDecimal(node.get("net_amount").asText()));

                if (node.has("paid_at") && !node.get("paid_at").isNull()) {
                    ps.setTimestamp(6, Timestamp.valueOf(node.get("paid_at").asText().replace("T", " ")));
                } else {
                    ps.setTimestamp(6, new Timestamp(System.currentTimeMillis()));
                }

                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Earnings inserted (" + count + " records)");
    }

    private void importReviews() throws Exception {
        JsonNode data = readJson("reviews.json");
        int count = 0;

        String sql = """
            INSERT INTO reviews (booking_id, consumer_id, thekedar_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
            """;

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (JsonNode node : data) {
                String bookingRef = node.get("bookingRef").asText();
                UUID bookingId = getBookingIdByRef(bookingRef);
                UUID consumerId = getUserIdByEmail(node.get("consumerEmail").asText());
                UUID thekedarId = getUserIdByEmail(node.get("thekedarEmail").asText());

                ps.setObject(1, bookingId);
                ps.setObject(2, consumerId);
                ps.setObject(3, thekedarId);
                ps.setInt(4, node.get("rating").asInt());
                ps.setString(5, node.get("comment").asText());
                ps.addBatch();
                count++;
            }
            ps.executeBatch();
        }

        System.out.println("✓ Reviews inserted (" + count + " records)");
    }

    // -------------------------------------------------------------------------
    // Clean Database
    // -------------------------------------------------------------------------

    private void cleanDatabase() throws SQLException {
        System.out.println("Cleaning database...");

        executeDelete("DELETE FROM earnings");
        executeDelete("DELETE FROM reviews");
        executeDelete("DELETE FROM booking_workers");
        executeDelete("DELETE FROM bookings");
        executeDelete("DELETE FROM thekedar_services");
        executeDelete("DELETE FROM workers");
        executeDelete("DELETE FROM thekedars");
        // Clear address_id FK before deleting addresses (users -> addresses via address_id)
        executeDelete("UPDATE users SET address_id = NULL");
        executeDelete("DELETE FROM addresses");
        executeDelete("DELETE FROM users WHERE role IN ('consumer','thekedar')");

        conn.commit();
        System.out.println("Database cleaned.");
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

    private UUID getAddressIdByEmail(String email) throws SQLException {
        String sql = "SELECT id FROM addresses WHERE user_id = (SELECT id FROM users WHERE email = ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getObject("id", UUID.class);
                }
            }
        }
        throw new SQLException("Address not found for email: " + email);
    }

    private UUID getBookingIdByRef(String bookingRef) throws SQLException {
        String sql = """
            SELECT b.id FROM bookings b
            JOIN users u ON b.consumer_id = u.id
            JOIN app_services s ON b.service_id = s.id
            WHERE u.email = ? AND s.slug = ?
            ORDER BY b.created_at DESC
            LIMIT 1
            """;

        String[] parts = bookingRef.split("-");
        String email = parts[0] + "." + parts[1] + "@gmail.com";
        // Date is at indices 2,3,4 (year-month-day), slug starts at index 5
        StringBuilder slugBuilder = new StringBuilder();
        for (int i = 5; i < parts.length; i++) {
            if (i > 5) slugBuilder.append("-");
            slugBuilder.append(parts[i]);
        }
        String slug = slugBuilder.toString();

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, slug);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getObject("id", UUID.class);
                }
            }
        }
        throw new SQLException("Booking not found for ref: " + bookingRef);
    }

    private UUID getWorkerIdByMobile(String mobile) throws SQLException {
        String sql = "SELECT id FROM workers WHERE mobile = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, mobile);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getObject("id", UUID.class);
                }
            }
        }
        throw new SQLException("Worker not found for mobile: " + mobile);
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
    }
}
