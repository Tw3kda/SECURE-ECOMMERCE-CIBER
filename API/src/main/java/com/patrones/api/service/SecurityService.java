import org.springframework.stereotype.Service;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import java.util.regex.Pattern;
import java.util.*;

@Service
public class SecurityService {
    
    // SQL Injection patterns
    private static final Pattern[] SQL_INJECTION_PATTERNS = {
        Pattern.compile("(?i)(\\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER|CREATE|TRUNCATE)\\b)"),
        Pattern.compile("(?i)(\\b(OR|AND)\\s+\\d+\\s*=\\s*\\d+)"),
        Pattern.compile("(?i)(\\b(SLEEP|WAITFOR|DELAY)\\b)"),
        Pattern.compile("(--|#|/\\*|\\*/)"),
        Pattern.compile("(?i)(\\b(XP_|SP_)\\w+\\b)"),
        Pattern.compile("(;|\\|\\||&&)"),
        Pattern.compile("('|%27|%22)")
    };
    
    // XSS patterns
    private static final Pattern[] XSS_PATTERNS = {
        Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("src[\r\n]*=[\r\n]*'(.*?)'", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("</script>", Pattern.CASE_INSENSITIVE),
        Pattern.compile("<script(.*?)>", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("eval\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("expression\\((.*?)\\)", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("javascript:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("vbscript:", Pattern.CASE_INSENSITIVE),
        Pattern.compile("onload(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL),
        Pattern.compile("onerror(.*?)=", Pattern.CASE_INSENSITIVE | Pattern.MULTILINE | Pattern.DOTALL)
    };

    /**
     * Clean input from SQL Injection and XSS attacks
     */
    public String cleanInput(String input) {
        if (input == null) return null;
        
        String cleaned = input.trim();
        cleaned = preventSqlInjection(cleaned);
        cleaned = preventXss(cleaned);
        
        return cleaned;
    }

    /**
     * Prevent SQL Injection attacks
     */
    private String preventSqlInjection(String input) {
        String cleaned = input;
        
        // Remove SQL injection patterns
        for (Pattern pattern : SQL_INJECTION_PATTERNS) {
            cleaned = pattern.matcher(cleaned).replaceAll("");
        }
        
        // Escape single quotes
        cleaned = cleaned.replace("'", "''");
        
        return cleaned;
    }

    /**
     * Prevent XSS attacks using JSoup and regex
     */
    private String preventXss(String input) {
        String cleaned = input;
        
        // Remove XSS patterns using regex
        for (Pattern pattern : XSS_PATTERNS) {
            cleaned = pattern.matcher(cleaned).replaceAll("");
        }
        
        // Use JSoup for HTML sanitization
        cleaned = Jsoup.clean(cleaned, Safelist.none());
        
        // Encode special characters
        cleaned = cleaned.replace("<", "&lt;")
                        .replace(">", "&gt;")
                        .replace("\"", "&quot;")
                        .replace("'", "&#x27;")
                        .replace("/", "&#x2F;");
        
        return cleaned;
    }

    /**
     * Clean a map of parameters (useful for request parameters)
     */
    public Map<String, String> cleanParameters(Map<String, String> parameters) {
        Map<String, String> cleanedParams = new HashMap<>();
        
        for (Map.Entry<String, String> entry : parameters.entrySet()) {
            String cleanedKey = cleanInput(entry.getKey());
            String cleanedValue = cleanInput(entry.getValue());
            cleanedParams.put(cleanedKey, cleanedValue);
        }
        
        return cleanedParams;
    }

    /**
     * Clean a list of inputs
     */
    public List<String> cleanInputs(List<String> inputs) {
        List<String> cleanedInputs = new ArrayList<>();
        
        for (String input : inputs) {
            cleanedInputs.add(cleanInput(input));
        }
        
        return cleanedInputs;
    }

    /**
     * Validate if input contains SQL injection attempts
     */
    public boolean hasSqlInjection(String input) {
        if (input == null) return false;
        
        for (Pattern pattern : SQL_INJECTION_PATTERNS) {
            if (pattern.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validate if input contains XSS attempts
     */
    public boolean hasXss(String input) {
        if (input == null) return false;
        
        for (Pattern pattern : XSS_PATTERNS) {
            if (pattern.matcher(input).find()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Safe clean for HTML content (allows basic formatting)
     */
    public String cleanHtml(String html) {
        if (html == null) return null;
        
        Safelist safeList = Safelist.basic()
            .addTags("p", "br", "strong", "em", "u", "ul", "ol", "li")
            .addAttributes("a", "href", "target")
            .addProtocols("a", "href", "http", "https");
        
        return Jsoup.clean(html, safeList);
    }

    /**
     * Clean numeric input
     */
    public String cleanNumeric(String input) {
        if (input == null) return null;
        return input.replaceAll("[^0-9.-]", "");
    }

    /**
     * Clean email input
     */
    public String cleanEmail(String email) {
        if (email == null) return null;
        
        String cleaned = cleanInput(email);
        // Basic email validation
        if (!cleaned.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new SecurityException("Invalid email format");
        }
        
        return cleaned;
    }
}